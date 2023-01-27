const db = require("../db");
const { Client } = require('podcast-api');
const { key } = require("../api-key.js")
const client = Client({ apiKey: key });

const dbCheckUser = async (username) => {
  const check = await db.query(
    `SELECT 
      username,
      first_name AS "firstName",
      last_name AS "lastName",
      email,
      is_admin AS "isAdmin"
     FROM users
     WHERE username = $1`, [username]);
  const user = check.rows[0];
  if (user) return user
  return false
}

const dbCheckUserWithPassword = async (username) => {
  const check = await db.query(
    `SELECT 
      username,
      password,
      first_name AS "firstName",
      last_name AS "lastName",
      email,
      is_admin AS "isAdmin"
     FROM users
     WHERE username = $1`, [username]);
  const user = check.rows[0];
  if (user) return user
  return false
}

const dbCheckPodcast = async (username, podcastId) => {
  const check = await db.query(
    `SELECT 
      username, 
      podcast_id AS "podcastId", 
      date_added AS "dateAdded",
      rating, 
      notes
    FROM user_podcasts
    WHERE username = $1 AND podcast_id = $2`, 
    [username, podcastId]
  )
  const saved = check.rows[0];
  if (saved) return saved;
  return false
}

const dbCheckEpisode = async (username, episodeId) => {
  const check = await db.query(
    `SELECT 
      username, 
      episode_id AS "episodeId", 
      date_listened AS "dateListened",
      time_stopped AS "timeStopped",
      rating, 
      notes
    FROM user_episodes
    WHERE username = $1 AND episode_id = $2`, 
    [username, episodeId]
  )
  const saved = check.rows[0];
  if (saved) return saved;
  return false
}

const dbCheckEpisodeTag = async (username, episodeId, tag) => {
  const check = await db.query(`
    SELECT *
    FROM episode_tags
    WHERE username = $1 AND episode_id = $2 AND tag = $3
  `, [username, episodeId, tag])

  const saved = check.rows[0]
  if (saved) return saved;
  return false
}

const dbCheckPodcastTag = async (username, podcastId, tag) => {
  const check = await db.query(`
    SELECT *
    FROM podcast_tags
    WHERE username = $1 AND podcast_id = $2 AND tag = $3
  `, [username, podcastId, tag])

  const saved = check.rows[0]
  if (saved) return saved;
  return false
}

const apiCheckPodcast = async (podcastId) => {
  const podcast = client.fetchPodcastById({
    id: podcastId
  })
  if (podcast) return podcast;
  return false
}

const apiCheckEpisode = async (episodeId) => {
  const episode = client.fetchEpisodeById({
    id: episodeId
  })
  if (episode) return episode;
  return false
}

module.exports = {dbCheckPodcast, dbCheckPodcastTag, dbCheckEpisodeTag, dbCheckEpisode, dbCheckUser, dbCheckUserWithPassword, apiCheckPodcast, apiCheckEpisode}