const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");


async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM listen_later");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM podcast_tags");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM episode_tags");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM user_episodes");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(`
    INSERT INTO users (username, first_name,last_name, password, email, is_admin)
    VALUES ('user1', 'first1', 'last1', $1, 'u1@gmail.com', true),
    ('user2', 'first2', 'last2', $2, 'u2@gmail.com', false),
    ('user3', 'first3', 'last3', $3, 'u3@gmail.com', false)
    RETURNING username`, [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password3", BCRYPT_WORK_FACTOR),
    ]);

  await db.query(`
    INSERT INTO user_podcasts (username, podcast_id, rating, notes)
    VALUES ('user1', '1', 5, 'notes 1'),
    ('user1', '2', 4, 'notes 2'),
    ('user2', '3', 2, 'notes 3')`)

  await db.query(`
    INSERT INTO user_episodes (username, episode_id, time_stopped, rating, notes)
    VALUES ('user1', '1', '00:02:41', 5, 'notes 1'),
    ('user1', '2', '00:18:13', 4, 'notes 2'),
    ('user2', '3', '00:39:02', 2, 'notes 3')`)
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
};