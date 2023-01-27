"use strict";

const request = require("supertest");

const app = require("../app");
const { UnauthorizedError, NotFoundError } = require("../expressError");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /episodes */

describe("POST /episodes", function () {
  const newEpisode = {
    username: "user1",
    episodeId: "5",
    data: {
      dateListened: "2023-01-14",
      timeStopped: "00:23:42",
      notes: "notes",
      rating: 5
    }
  };

  test("works", async function () {
    const resp = await request(app)
        .post("/episodes")
        .send(newEpisode)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      episode: {username: "user1", episodeId: "5", dateListened: expect.any(String), timeStopped: expect.any(String), rating: 5, notes: "notes"},
    });
  });

  test("unauth for wrong user", async function () {
    const resp = await request(app)
        .post("/episodes")
        .send(newEpisode)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/episodes")
        .send({
          username: "user1",
          rating: 5,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/episodes")
        .send({
          ...newEpisode,
          rating: "not-a-number",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /episodes */

describe("GET /episodes", function () {
  test("works w/o search term", async function () {
    const resp = await request(app)
      .get("/episodes")
      .set("authorization", `Bearer ${u1Token}`)
    expect(resp.body).toEqual({
      episodes:
          [
            {
              username: "user1",
              episodeId: '1',
              dateListened: expect.any(String),
              timeStopped: expect.any(String),
              rating: 1,
              notes: "notes 1",
            }
          ],
    });
  });

  test("works: search term", async function () {
    // add another ep
    const newSave = {
      username: "user1",
      episodeId: "4",
      data: {
        notes: "search term",
        rating: 4, 
      }
    };
    const save = await request(app)
      .post("/episodes")
      .send(newSave)
      .set("authorization", `Bearer ${adminToken}`)
    expect(save.body).toEqual({"episode": {
      username: 'user1',
      episodeId: '4',
      dateListened: null,  
      timeStopped: null,
      rating: 4,
      notes: "search term"
    }})
    // search for ep
    const resp = await request(app)
        .get("/episodes")
        .send({username: 'user1'})
        .set("authorization", `Bearer ${u1Token}`)
        .query({ term: "search term" });
    expect(resp.body).toEqual({
      episodes:
      [
        {
          username: "user1",
          episodeId: '4',
          dateListened: null, 
          timeStopped: null,
          rating: 4,
          notes: "search term"
        }
      ]
    });
  });


  test("not found if no results from search", async function () {
    const resp = await request(app)
        .get("/episodes")
        .query({ term: 'fjdkal'});
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /episodes/:episodeId */

describe("GET /episodes/:episodeId", function () {
  const newEpisode = {
    username: "user1",
    episodeId: "5",
    data: {
      notes: "notes",
      rating: 5
    }
  };
  test("works", async function () {
    const saved = await request(app)
      .post(`/episodes`)
      .send(newEpisode)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
      .get(`/episodes/${newEpisode.episodeId}`)
      .set("authorization", `Bearer ${u1Token}`)
    expect(resp.body).toEqual({
      episode: {dateListened: null, timeStopped: null, username: 'user1', episodeId: '5', notes: 'notes', rating: 5, tags: []},
    });
  });

  test("not found for unsaved ep", async function () {
    const resp = await request(app).get(`/episodes/420`).set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /episodes/:episodeId */

describe("PATCH /episodes/:episodeId", function () {
  const newEpisode = {
    username: "user1",
    episodeId: "5",
    data: {
      notes: "notes",
      rating: 5
    }
  };
  test("works for correct user", async function () {
    const saved = await request(app)
      .post(`/episodes`)
      .send(newEpisode)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
        .patch(`/episodes/${newEpisode.episodeId}`)
        .send({
          notes: "edited",
        })
        .set("authorization", `Bearer ${u1Token}`)
    expect(resp.body).toEqual({
      episode: {
        episodeId: '5',
        username: 'user1', 
        dateListened: null,
        timeStopped: null,
        rating: 5,
        notes: 'edited'
      },
    });
  });

  test("unauth for anon", async function () {
    const saved = await request(app)
      .post(`/episodes`)
      .send(newEpisode)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
        .patch(`/episodes/${saved.body.episode.episodeId}`)
        .send({
          notes: "new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such episode", async function () {
    const resp = await request(app)
        .patch(`/episodes/420`)
        .send({
          notes: "nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on episodeId change attempt", async function () {
    const saved = await request(app)
      .post(`/episodes`)
      .send(newEpisode)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
        .patch(`/episodes/${saved.body.episode.episodeId}`)
        .send({
          episodeId: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const saved = await request(app)
    .post(`/episodes`)
    .send(newEpisode)
    .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
        .patch(`/episodes/${saved.body.episode.episodeId}`)
        .send({
          rating: "not-an-integer",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /episodes/:handle */

describe("DELETE /episodes/:episodeId", function () {
  const newEpisode = {
    username: "user1",
    episodeId: "5",
    data: {
      notes: "notes",
      rating: 5
    }
  };
  test("works for admin", async function () {
    const saved = await request(app)
      .post(`/episodes`)
      .send(newEpisode)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
      .delete(`/episodes/${saved.body.episode.episodeId}`)
      .set("authorization", `Bearer ${adminToken}`)
      .send({username: 'user1'});
    expect(resp.body).toEqual({
      deleted: '5'
    });
  });

  test("works for correct user", async function () {
    const saved = await request(app)
      .post(`/episodes`)
      .send(newEpisode)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
      .delete(`/episodes/${saved.body.episode.episodeId}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      deleted: saved.body.episode.episodeId
    });
  });

  test("unauth for incorrect user", async function () {
    try {
      const saved = await request(app)
        .post(`/episodes`)
        .send(newEpisode)
        .set("authorization", `Bearer ${adminToken}`);
      const resp = await request(app)
        .delete(`/episodes/${saved.body.episode.episodeId}`)
        .set("authorization", `Bearer ${u2Token}`);
    }
    catch(err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth for anon", async function () {
    try {
      const saved = await request(app)
        .post(`/episodes`)
        .send(newEpisode)
        .set("authorization", `Bearer ${adminToken}`);
      const resp = await request(app)
        .delete(`/episodes/${saved.body.episode.episodeId}`)
    }
    catch(err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("not found for no such episode", async function () {
    try {
      const resp = await request(app)
        .delete(`/episodes/999`)
        .set("authorization", `Bearer ${adminToken}`);
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
