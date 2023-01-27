"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Podcast = require("./podcast.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(async () => {await commonBeforeAll()});
beforeEach(async () => {await commonBeforeEach()});
afterEach(async () => {await commonAfterEach()});
afterAll(async () => {await commonAfterAll()}, 2000);


/************************************** save podcast */
describe("save podcast", function () {

  test("works", async function () {
    let saved = await Podcast.savePodcast('user1', '55', {rating: 5, notes: "note"});
    expect(saved).toEqual({username: 'user1', podcastId: '55', dateAdded: expect.any(Date), rating: 5, notes: 'note'});
  });

  test("bad request with dup data", async function () {
    try {
      await Podcast.savePodcast('user1', '1');
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request with nonexistant username", async function () {
    try {
      await Podcast.savePodcast('user12', '1');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*********************************** get saved podcast */
describe("get saved podcast", function() {
  test("works", async function() {
    // save a podcast
    const saved = await Podcast.savePodcast('user1', '55', {rating: 5, notes: "note"});

    // get that podcast
    const podcast = await Podcast.getSavedPodcast('user1', '55');
    expect(saved).toEqual(podcast);
  })

  test("bad request with nonexistant save", async function() {
    try{
      const podcast = await Podcast.getSavedPodcast('55534254');
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})


/************************* get all user's saved podcasts */
describe("get all user's saved podcasts", function() {
  test("works", async function() {
    const podcasts = await Podcast.getAllSavedPodcasts('user1');
    expect(podcasts.length).toBe(2)
    expect(podcasts).toEqual([
      {notes: "notes 1", podcastId: "1", dateAdded: expect.any(Date), rating: 5, username: "user1"},
      {username: "user1", podcastId: "2", dateAdded: expect.any(Date), rating: 4, notes: "notes 2"}
    ]);
  })

  test("bad request with nonexistant user", async function() {
    try {
      const podcasts = await Podcast.getAllSavedPodcasts('wrong');
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("returns empty array if no saved pods", async function() {
    const podcasts = await Podcast.getAllSavedPodcasts('user3');
    expect(podcasts).toEqual([])
  })
})



/*********************************************** update saved pod */
describe("Update saved podcast notes/rating", function() {
  test("works", async function() {
    const newSave = await Podcast.savePodcast('user1', '4', {rating: 2});
    expect(newSave.rating).toEqual(2);
    
    // update pod with new rating
    const updated = await Podcast.updatePodcast('user1', '4', {rating: 5});
    expect(updated.rating).toEqual(5);

    // check that update actually sticks
    const fetched = await Podcast.getSavedPodcast('user1', '4');
    expect(fetched.rating).toEqual(5)
  })

  test("Not found - user not yet saved pod", async function() {
    try {
      const updated = await Podcast.updatePodcast('user1', '999', {rating: 5});
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    } 
  })

  test("Bad request - update data missing", async function() {
    try {
      const newSave = await Podcast.savePodcast('user1', '4', {rating: 2});
      expect(newSave.rating).toEqual(2);
      const updated = await Podcast.updatePodcast('user1', '4')
      fail();
    }
    catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })
})


/****************************************************** unsave podcast */
describe("Remove podcast save", function() {
  test("works", async function() {
    // add podcast
    const newSave = await Podcast.savePodcast('user1', '999')
    expect(newSave.podcastId).toEqual('999')

    // remove podcast
    const removed = await Podcast.removeSave('user1', '999')
    expect(removed).toEqual({Removed: newSave.podcastId});

    // check
    try {
      const check = await Podcast.getSavedPodcast('user1', '999');
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("NotFound if user had not saved pod", async function() {
    try {
      const removed = await Podcast.removeSave('user1', '999');
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})


/*************************************** tag podcast */
describe('Tags a podcast', function() {
  test("works", async function() {
    const tag = await Podcast.tagPodcast('user1', '1', 'tag')
    expect(tag.id).toEqual(expect.any(Number));
  })

  test("Bad request for missing parameters", async function() {
    try {
      const tag = await Podcast.tagPodcast('user1');
      fail();
    }
    catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })

  test("Not found error for nonexistant username", async function() {
    try {
      const tag = await Podcast.tagPodcast('user111', '1', 'tag');
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("Bad request for duplicate tag", async function() {
    try {
      const tag = await Podcast.tagPodcast('user1', '1', 'tag');
      const duplicate = await Podcast.tagPodcast('user1', '1', 'tag');
      fail();
    }
    catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })
})

/************************************************** untag a Podcast */
describe('Removes tag from Podcast', function() {
  test("works", async function() {
    // add tag
    const tag = await Podcast.tagPodcast('user1', '1', 'tag');

    // remove tag
    const removed = await Podcast.untagPodcast(tag.id);
    expect(removed).toEqual({Removed: tag.id})
  })

  test("not found for nonexistant tag", async function() {
    try {
      const removed = await Podcast.untagPodcast(45678);
      fail()
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})


/*************************************************** get user pods by tag */
describe('Gets list of podcasts user has saved with particular tag', function() {
  test("works", async function() {
    // add tags
    const tag1 = await Podcast.tagPodcast('user1', '1', 'tag')
    const tag2 = await Podcast.tagPodcast('user1', '2', 'tag')

    // get pods list with tag 'tag'
    const pods = await Podcast.getUserPodcastsByTag('user1', 'tag');
    expect(pods.length).toEqual(2);
  })

  test("Not found if no saved Podcasts with that tag", async function() {
    try {
      const eps = await Podcast.getUserPodcastsByTag('user1', 'wrong');
      fail()
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("Not found if user does not exist", async function() {
    try {
      const eps = await Podcast.getUserPodcastsByTag('user1111', 'tag');
      fail()
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})