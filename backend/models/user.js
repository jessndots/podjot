"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { Client } = require('podcast-api');
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

const {dbCheckUser, dbCheckUserWithPassword, dbCheckPodcast, apiCheckPodcast, apiCheckEpisode} = require("../helpers/preChecks")

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError if user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const user = await dbCheckUserWithPassword(username)

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({ username, password, firstName, lastName, email, isAdmin }) {
    const duplicateCheck = await dbCheckUser(username);

    if (duplicateCheck) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
        [
          username,
          hashedPassword,
          firstName,
          lastName,
          email,
          isAdmin,
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const user = await dbCheckUser(username);

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const userPodcastsRes = await db.query(`
      SELECT p.podcast_id
      FROM user_podcasts AS p
      WHERE p.username = $1`, [username])
    const userEpisodesRes = await db.query(
      `SELECT e.episode_id
      FROM user_episodes AS e
      WHERE e.username = $1`, [username]
    )
    
    user.podcasts = userPodcastsRes.rows.map(p => p.podcast_id)
    user.episodes = userEpisodesRes.rows.map(e => e.episode_id);
    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          email: "email",
          isAdmin: "is_admin",
        });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  

  /** Save podcast episode: update db, returns Saved message.
   *
   * - username: username adding the episode
   * - episode_id: episode id from api
   * - data to be saved: rating, notes, date listened, time stopped
   **/

  static async saveEpisode(username, episodeId, data) {
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`User not found: ${username}`)

    const episodeInDb = await dbCheckEpisode(username, episodeId);
    if (episodeInDb) throw new BadRequestError(`User already saved episode`);

    const episodeInApi = await apiCheckEpisode(episodeId);
    if (!episodeInApi) throw new NotFoundError(`No episode: ${episodeId}`);
    
    const results = await db.query(
        `INSERT INTO user_episodes
        (username, episode_id, date_listened, time_stopped, rating, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, podcast_id AS podcastId, date_listened AS dateListened, time_stopped AS timeStopped, rating, notes`, 
        [username, episodeId, data.dateListened, data.timeStopped, data.rating, data.notes]
    )
    const saved = results.rows[0];
    if (!saved) throw new BadRequestError(`Something went wrong. Could not save episode.`)
    return saved
  }

  /** Update user_episodes table in db, returns saved message
   * - username: username updating the episode
   * - episode_id: episode id from api
   * - data to be updated: rating, notes, date listened, time stopped
   */
  static async updateEpisode(username, episodeId, data){
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`User not found: ${username}`)

    const episodeInDb = await dbCheckPodcast(username, episodeId);
    if (!episodeInDb) throw new NotFoundError(`Episode has not yet been saved by this user`)
    
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        date_listened: "dateListened",
        time_stopped: "timeStopped",
        rating: "rating",
        notes: "notes",
      });
    const usernameVarIdx = "$" + (values.length + 1);
    const episodeVarIdx = "$" + (values.length + 2)
    const querySql = `UPDATE user_episodes
          SET ${setCols} 
          WHERE username = ${usernameVarIdx} AND episode_id = ${episodeVarIdx}
          RETURNING username, episode_id AS episodeId`
    const result = await db.query(querySql, [...values, username, episodeId]);
    const saved = result.rows[0];
    if (!saved) throw new BadRequestError(`Something went wrong. Could not save episode.`)
    return {Saved: episodeId}
  }


  /** Tag a podcast, returns undefined
   * username: of user tagging the pod
   * podcast_id: id of podcast from api
   * tag: text to tag podcast with
   */
  static async tagPodcast(username, podcastId, tagText) {
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`User not found: ${username}`)

    const tag = await dbCheckPodcastTag(username, podcastId, tag);
    if (tag) throw new BadRequestError(`This podcast already has this tag.`);

    const results = await db.query(`
      INSERT INTO podcast_tags
      (username, podcast_id, tag)
      VALUES ($1, $2, $3)
      RETURNING username, podcast_id, tag`, 
      [username, podcastId, tag])
    const saved = results.rows[0];
    if (!saved) throw new BadRequestError(`Something went wrong. Podcast tag was not saved.`)
    return
  }

  /** Untag a podcast, returns undefined 
   * tagId: id of tag to remove
  */
}


module.exports = User;
