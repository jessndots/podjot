"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Podcast = require("../models/podcast");
const Episode = require("../models/episode");
const { createToken } = require("../helpers/tokens");

const testJobIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM user_podcasts");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM user_episodes");


  await User.register({
    username: "user1",
    firstName: "first1",
    lastName: "last1",
    email: "user1@gmail.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "user2",
    firstName: "first2",
    lastName: "last2",
    email: "user2@gmail.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "admin",
    firstName: "first3",
    lastName: "last3",
    email: "user3@gmail.com",
    password: "password3",
    isAdmin: true,
  });

  await Podcast.savePodcast('user1', '1', {rating: 1, notes: 'notes 1'});
  await Podcast.savePodcast('user2', '2', {rating: 2, notes: 'notes 2'});
  await Podcast.savePodcast('admin', '3', {rating: 3, notes: 'notes 3'});

  await Episode.saveEpisode('user1', '1', {rating: 1, notes: 'notes 1', dateListened: '2023-01-14', timeStopped: '00:14:35'})
  await Episode.saveEpisode('user2', '2', {rating: 2, notes: 'notes 2', timeStopped: '00:14:35'})
  await Episode.saveEpisode('admin', '3', {rating: 3, notes: 'notes 3', timeStopped: '00:14:35'})

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


const u1Token = createToken({ username: "user1", isAdmin: false });
const u2Token = createToken({ username: "user2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
};
