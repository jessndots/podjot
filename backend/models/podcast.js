"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
} = require("../expressError");

const { key } = require("../api-key.js")

const { dbCheckUser, dbCheckPodcast, dbCheckPodcastTag } = require("../helpers/preChecks")


/** Related functions for podcasts. */
class Podcast {

  /** Save podcast: add podcast to user_podcasts, returns Saved message.
   *
   * - username: username adding the podcast
   * - podcast_id: podcast id from api
   * - data: rating, note that user set 
   **/
  static async savePodcast(username, podcastId, data = { rating: null, notes: null }) {
    const userInDb = await dbCheckUser(username);
    if (!userInDb) throw new NotFoundError(`Could not find user: ${username}`)
    const podcastInDb = await dbCheckPodcast(username, podcastId);
    if (podcastInDb) throw new BadRequestError(`User already saved podcast`);

    const results = await db.query(
      `INSERT INTO user_podcasts
        (username, podcast_id, rating, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING username, podcast_id AS "podcastId", date_added AS "dateAdded", rating, notes`,
      [username, podcastId, data.rating, data.notes]
    )

    const saved = results.rows[0];
    if (!saved) throw new BadRequestError(`Something went wrong. Could not save podcast.`)
    return saved
  }

  /** Get saved podcast: fetches and returns saved podcast data 
   * username: of current user
   * podcastId: from api
  */
  static async getSavedPodcast(username, podcastId) {
    const results = await db.query(`
      SELECT username, podcast_id AS "podcastId", date_added AS "dateAdded", rating, notes
      FROM user_podcasts
      WHERE podcast_id = $1 AND username = $2`, [podcastId, username])
    const savedPod = results.rows[0];
    if (!savedPod) throw new NotFoundError(`User has not saved this podcast.`);
    return savedPod
  }

  /** Get all podcasts saved by current user, returns list of podcasts with details
   * username: of current user
   * TO DO: FIGURE OUT HOW TO FILTER WITH SEARCH QUERY
   */
  static async getAllSavedPodcasts(username, searchQuery) {
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`No user with username: ${username}`)
    if (searchQuery) {
      const results = await db.query(`
        SELECT username, podcast_id AS "podcastId", date_added AS "dateAdded", rating, notes
        FROM user_podcasts
        WHERE username = $1 AND notes LIKE $2
        `, [username, `%${searchQuery}%`]);
      const pods = results.rows
      return pods
    }
    console.log('no search query')
    const results = await db.query(`
        SELECT username, podcast_id AS "podcastId", date_added AS "dateAdded", rating, notes
        FROM user_podcasts
        WHERE username = $1`, [username])
    const savedPods = results.rows;
    return savedPods

  }


  /** Update saved podcast: update user_podcasts, returns updated save data.
   *
   * - username: of current user
   * - podcastId: from api
   * - data: rating, notes 
   **/
  static async updatePodcast(username, podcastId, data) {
    if (!data) throw new BadRequestError(`Data parameter is required. Example: {rating: 3, notes: 'example notes'} `)
    const check = await db.query(`
      SELECT date_added
      FROM user_podcasts 
      WHERE username = $1 AND podcast_id = $2`, [username, podcastId]);
    if (!check.rows[0]) throw new NotFoundError(`User has not yet saved this podcast.`)

    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        rating: "rating",
        notes: "notes",
      });
    const usernameVarIdx = "$" + (values.length + 1);
    const podcastIdVarIdx = "$" + (values.length + 2);
    const querySql = `UPDATE user_podcasts
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} AND podcast_id = ${podcastIdVarIdx}
                      RETURNING username, podcast_id AS "podcastId", date_added AS "dateAdded", rating, notes`
    const result = await db.query(querySql, [...values, username, podcastId]);
    const saved = result.rows[0];
    if (!saved) throw new BadRequestError(`Something went wrong. Could not save podcast.`)
    return saved
  }

  /** Remove podcast from current user saved pods, returns undefined
   * username: of current user
   * podcastId: from api
   */
  static async removeSave(username, podcastId) {
    const results = await db.query(`
      DELETE 
      FROM user_podcasts
      WHERE username = $1 AND podcast_id = $2
      RETURNING podcast_id AS "podcastId"`, [username, podcastId])
    const removed = results.rows[0];
    if (!removed) throw new NotFoundError(`User has not yet saved this podcast.`);
    return { Removed: removed.podcastId }
  }

  /** Add user tag to podcast
   * username: user who sets up the tag
   * podcastId: from the api
   * tag: text of tag
   */
  static async tagPodcast(username, podcastId, tag) {
    if (!username) throw new BadRequestError(`Username is required.`)
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`No user with username: ${username}`);
    if (!podcastId) throw new BadRequestError(`Podcast id is required.`);
    if (!tag) throw new BadRequestError(`Tag is required.`);

    const check = await dbCheckPodcastTag(username, podcastId, tag)
    if (check) throw new BadRequestError(`This tag already exists.`)

    const results = await db.query(`
      INSERT INTO podcast_tags
      (username, podcast_id, tag)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [username, podcastId, tag])
    const tagId = results.rows[0];
    return tagId
  }

  /** Untag a podcast
   * id: db id of tag
   */
  static async untagPodcast(tagId) {
    if (!tagId) throw new BadRequestError(`Tag id is required.`)

    const results = await db.query(`
      DELETE
      FROM podcast_tags
      WHERE id = $1
      RETURNING id
    `, [tagId]);
    if (!results.rows[0]) throw new NotFoundError(`Tag not found`)
    const removed = results.rows[0];
    return { Removed: removed.id }
  }

  /** Get user podcasts by tag
   * tag: tag to be searched
   */
  static async getUserPodcastsByTag(username, tag) {
    if (!tag) throw new BadRequestError(`Tag is required.`);
    if (!username) throw new BadRequestError(`Username is required.`)
    const user = await dbCheckUser(username);
    if (!user) throw new NotFoundError(`No user with username: ${username}`);

    const results = await db.query(`
      SELECT p.username, p.podcast_id, p.date_added, p.rating, p.notes
      FROM user_podcasts p
      JOIN podcast_tags t ON p.podcast_id = t.podcast_id
      WHERE t.tag = $1 AND t.username = $2
    `, [tag, username]);

    const pods = results.rows
    if (results.rows.length === 0) throw new NotFoundError('User has not saved any podcasts with this tag.');
    return pods
  }
}

module.exports = Podcast