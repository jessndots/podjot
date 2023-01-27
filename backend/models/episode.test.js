"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Episode = require("./episode.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("./_testCommon");

beforeAll(async () => {await commonBeforeAll()});
beforeEach(async () => {await commonBeforeEach()});
afterEach(async () => {await commonAfterEach()});
afterAll(async () => {await commonAfterAll()}, 2000);


/************************************** save episode */
describe("save episode", function () {
  test("works", async function () {
    let saved = await Episode.saveEpisode('user1', '55', {rating: 5, notes: "note", dateListened: null, timeStopped: null});
    expect(saved).toEqual({username: 'user1', episodeId: '55', dateListened: null, timeStopped: null, rating: 5, notes: 'note'});
  });

  test("bad request with dup data", async function () {
    try {
      await Episode.saveEpisode('user1', '1');
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request with nonexistant username", async function () {
    try {
      await Episode.saveEpisode('user12', '1');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*********************************** get saved episode */
describe("get saved episode", function() {
  test("works", async function() {
    // save an episode
    const saved = await Episode.saveEpisode('user1', '55', {rating: 5, notes: "note"});

    // get that episode
    const episode = await Episode.getSavedEpisode('user1', '55');
    expect(episode).toEqual({username: 'user1', episodeId: '55', dateListened: null, timeStopped: null, rating: 5, notes: "note", tags: []});
  })

  test("works with tags", async function() {
    // save an episode
    const saved = await Episode.saveEpisode('user1', '55', {rating: 5, notes: "note"});

    // add tags
    await Episode.tagEpisode('user1', '55', 'tag 1');
    await Episode.tagEpisode('user1', '55', 'tag 2')

    // get that episode
    const episode = await Episode.getSavedEpisode('user1', '55');
    expect(episode).toEqual({username: 'user1', episodeId: '55', dateListened: null, timeStopped: null, rating: 5, notes: "note", tags: ['tag 1', 'tag 2']});
  })

  test("bad request with unsaved ep", async function() {
    try{
      const episode = await Episode.getSavedEpisode('user1', '3456789');
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})


/************************* get all user's saved episodes */
describe("get all user's saved episodes", function() {
  test("works", async function() {
    const episodes = await Episode.getAllSavedEpisodes('user1');
    expect(episodes.length).toBe(2)
  })

  test("bad request with nonexistant user", async function() {
    try {
      const episodes = await Episode.getAllSavedEpisodes('wrong');
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("returns empty array if no saved eps", async function() {
    const episodes = await Episode.getAllSavedEpisodes('user3');
    expect(episodes).toEqual([])
  })
})



/*********************************************** update saved ep */
describe("Update saved episode notes/rating", function() {
  test("works", async function() {
    const newSave = await Episode.saveEpisode('user1', '4', {rating: 2});
    expect(newSave.rating).toEqual(2);
    
    // update ep with new rating
    const updated = await Episode.updateEpisode('user1', '4', {rating: 5});
    expect(updated.rating).toEqual(5);

    // check that update actually sticks
    const fetched = await Episode.getSavedEpisode('user1', '4');
    expect(fetched.rating).toEqual(5)
  })

  test("Not found - user not yet saved ep", async function() {
    try {
      const updated = await Episode.updateEpisode('user1', '999', {rating: 5});
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    } 
  })

  test("Bad request - update data missing", async function() {
    try {
      const updated = await Episode.updateEpisode('user1', '1')
      fail();
    }
    catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })
})


/****************************************************** unsave episode */
describe("Remove episode save", function() {
  test("works", async function() {
    // add episode
    const newSave = await Episode.saveEpisode('user1', '999')
    expect(newSave.episodeId).toEqual('999')

    // remove episode
    const removed = await Episode.removeEpisode('user1', '999')
    expect(removed).toEqual({Removed: '999'});

    // check
    try {
      const check = await Episode.getSavedEpisode('user1', '999');
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("NotFound if user had not saved ep", async function() {
    try {
      const removed = await Episode.removeEpisode('user1', '999');
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})


/*************************************** tag episode */
describe('Tags an episode', function() {
  test("works", async function() {
    const tag = await Episode.tagEpisode('user1', '1', 'tag')
    expect(tag.id).toEqual(expect.any(Number));
  })

  test("Bad request for missing parameters", async function() {
    try {
      const tag = await Episode.tagEpisode('user1');
      fail();
    }
    catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })

  test("Not found error for nonexistant username", async function() {
    try {
      const tag = await Episode.tagEpisode('user111', '1', 'tag');
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("Bad request for duplicate tag", async function() {
    try {
      const tag = await Episode.tagEpisode('user1', '1', 'tag');
      const duplicate = await Episode.tagEpisode('user1', '1', 'tag');
      fail();
    }
    catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })
})

/************************************************** untag an episode */
describe('Removes tag from episode', function() {
  test("works", async function() {
    // add tag
    const tag = await Episode.tagEpisode('user1', '1', 'tag');

    // remove tag
    const removed = await Episode.untagEpisode(tag.id);
    expect(removed).toEqual({Removed: tag.id})
  })

  test("not found for nonexistant tag", async function() {
    try {
      const removed = await Episode.untagEpisode(45678);
      fail()
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})


/*************************************************** get user eps by tag */
describe('Gets list of episodes user has saved with particular tag', function() {
  test("works", async function() {
    // add tags
    const tag1 = await Episode.tagEpisode('user1', '1', 'tag')
    const tag2 = await Episode.tagEpisode('user1', '2', 'tag')

    // get episodes list with tag 'tag'
    const episodes = await Episode.getUserEpisodesByTag('user1', 'tag');
    expect(episodes.length).toEqual(2);
  })

  test("Not found if no saved episodes with that tag", async function() {
    try {
      const eps = await Episode.getUserEpisodesByTag('user1', 'wrong');
      fail()
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })

  test("Not found if user does not exist", async function() {
    try {
      const eps = await Episode.getUserEpisodesByTag('user1111', 'tag');
      fail()
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  })
})