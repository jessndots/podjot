"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
} = require("../expressError");


const {dbCheckUser, dbCheckEpisode, dbCheckEpisodeTag} = require("../helpers/preChecks")


/** Related functions for episodes. */
class Episode {

  /** Save episode: add episode to user_episodes, returns save data.
   *
   * - username: username adding the episode
   * - episode_id: episode id from api
   * - data: rating, note, time paused, date listened 
   **/
   static async saveEpisode(username, episodeId, data={rating: null, notes: null, favorite: false, dateListened: null, timeStopped: null}) {
    const userInDb = await dbCheckUser(username);
    if (!userInDb) throw new NotFoundError(`User not found: ${username}`)
    const episodeInDb = await dbCheckEpisode(username, episodeId);
    if (episodeInDb) throw new BadRequestError(`User already saved episode`);
    const results = await db.query(
        `INSERT INTO user_episodes
        (username, episode_id, rating, notes, favorite, date_listened, time_stopped)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username, episode_id AS "episodeId", date_listened AS "dateListened", time_stopped AS "timeStopped", rating, favorite, notes`, 
        [username, episodeId, data.rating, data.notes, data.favorite, data.dateListened, data.timeStopped]
    )
    const saved = results.rows[0];
    if (!saved) throw new BadRequestError(`Something went wrong. Could not save episode.`)
    return saved
  }

  /** Get user episode: fetches and returns user episode data 
   *  username: of current user
   *  episodeId: from api
  */
  static async getSavedEpisode(username, episodeId) {
    const results = await db.query(`
      SELECT username, episode_id AS "episodeId", date_listened AS "dateListened", time_stopped AS "timeStopped", rating, notes, favorite
      FROM user_episodes
      WHERE username = $1 AND episode_id = $2`, [username, episodeId])
    const savedPod = results.rows[0];
    if (!savedPod) throw new NotFoundError(`User has not saved this episode.`);

    return savedPod
  }

  /** Get all episodes saved by current user, returns list of episodes with details
   * username: of current user
   */
  static async getAllSavedEpisodes(username, searchQuery) {
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`No user with username: ${username}`)
    if (searchQuery) {
      const results = await db.query(`
        SELECT username, episode_id AS "episodeId", date_listened AS "dateListened", time_stopped AS "timeStopped", rating, notes, favorite
        FROM user_episodes
        WHERE username = $1 AND notes LIKE $2
        `, [username, `%${searchQuery}%`]);
      const eps = results.rows
      return eps
    }
    const results = await db.query(`
        SELECT username, episode_id AS "episodeId", date_listened AS "dateListened", time_stopped AS "timeStopped", rating, notes, favorite
        FROM user_episodes
        WHERE username = $1`, [username])
    const savedEps = results.rows;
    return savedEps
 
  }

  /** Get all favorite episodess saved by current user, returns list of episodes with details
   * username: of current user
   */
  static async getFavoriteEpisodes(username) {
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`No user with username: ${username}`)
    const results = await db.query(`
        SELECT username, episode_id AS "episodeId", date_listened AS "dateListened", time_stopped AS "timeStopped", rating, notes, favorite
        FROM user_episodes
        WHERE username = $1 AND favorite = true`, [username])
    const savedPods = results.rows;
    return savedPods
  }

  /** Get all episodes with notes saved by current user , returns list of episodes with details
   * username: of current user
   */
  static async getEpisodesWithNotes(username) {
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`No user with username: ${username}`)
    const results = await db.query(`
        SELECT username, episode_id AS "episodeId", date_listened AS "dateListened", time_stopped AS "timeStopped", rating, notes, favorite
        FROM user_episodes
        WHERE username = $1 AND notes IS NOT NULL`, [username])
    const savedEps = results.rows;
    return savedEps
  }

  /** Update episode: update user_episodes, returns Saved message.
   *
   * - username: of current user
   * - episodeId: from api
   * - data: rating, notes 
   **/
  static async updateEpisode(username, episodeId, data){
    if (!data) {throw new BadRequestError(`Data parameter is required.`)}
    const check = await dbCheckEpisode(username, episodeId);
    if (!check) throw new NotFoundError(`User has not yet saved this episode.`)
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        dateListened: "date_listened",
        timeStopped: "time_stopped",
        rating: "rating",
        notes: "notes",
        favorite: "favorite"
      });
    const usernameVarIdx = "$" + (values.length + 1);
    const episodeIdVarIdx = "$" + (values.length + 2);
    const querySql = `UPDATE user_episodes
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} AND episode_id = ${episodeIdVarIdx}
                      RETURNING username, episode_id AS "episodeId", date_listened AS "dateListened", time_stopped AS "timeStopped", rating, notes, favorite`
    const result = await db.query(querySql, [...values, username, episodeId]);
    const saved = result.rows[0];
    if (!saved) throw new BadRequestError(`Something went wrong. Could not save episode.`)
    return saved
  }

  /** Remove episode from current user saved eps, returns undefined
   * username: of current user
   * episodeId: from api
   */
  static async removeSave(username, episodeId) {
    if (!episodeId) throw new BadRequestError(`EpisodeId is required.`)
    const results = await db.query(`
      DELETE 
      FROM user_episodes
      WHERE username = $1 AND episode_id = $2
      RETURNING episode_id AS "episodeId"`, [username, episodeId])
    const removed = results.rows[0];
    if (!removed) throw new NotFoundError(`User has not yet saved this episode.`);
    return {Removed: removed.episodeId}
  }


  /** Tag an episode
   * username: of user tagging episode
   * episodeId: from api
   */
  static async tagEpisode(username, episodeId, tag) {
    if (!username) throw new BadRequestError(`Username is a required parameter.`)
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`No user with username: ${username}`);
    if (!episodeId) throw new BadRequestError(`Episode id is required.`);
    if (!tag) throw new BadRequestError(`Tag is required.`);

    const check = await dbCheckEpisodeTag(username, episodeId, tag)
    if (check) throw new BadRequestError(`This tag already exists.`)

    const results = await db.query(`
      INSERT INTO episode_tags
      (username, episode_id, tag)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [username, episodeId, tag])
    const tagId = results.rows[0];
    return tagId
  }

  /** Untag an episode
   * id: db id of tag
   */
  static async untagEpisode(id) {
    if (!id) throw new BadRequestError(`Tag id is required.`)

    const results = await db.query(`
      DELETE
      FROM episode_tags
      WHERE id = $1
      RETURNING id
    `, [id]);
    if (!results.rows[0]) throw new NotFoundError(`Tag not found`)
    const removed = results.rows[0];
    return {Removed: removed.id}
  }

  /** Get user episodes by tag
   * tag: tag to be searched
   */
  static async getUserEpisodesByTag(username, tag) {
    if (!tag) throw new BadRequestError(`Tag is required.`);
    if (!username) throw new BadRequestError(`Username is a required parameter.`)
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`No user with username: ${username}`);

    const results = await db.query(`
      SELECT e.username, e.episode_id, e.date_listened, e.time_stopped, e.rating, e.notes
      FROM user_episodes e
      JOIN episode_tags t ON e.episode_id = t.episode_id
      WHERE t.tag = $1 AND t.username = $2
    `, [tag, username]);

    const eps = results.rows
    if (results.rows.length === 0) throw new NotFoundError('User has not saved any episodes with this tag.');
    return eps
  }

}

module.exports = Episode