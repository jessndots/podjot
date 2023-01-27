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

/************************************** POST /podcasts */

describe("POST /podcasts", function () {
  const newPodcast = {
    username: "user1",
    podcastId: "5",
    data: {
      notes: "notes",
      rating: 5
    }
  };

  test("works", async function () {
    const resp = await request(app)
        .post("/podcasts")
        .send(newPodcast)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      podcast: {username: "user1", podcastId: "5", dateAdded: expect.any(String), rating: 5, notes: "notes"},
    });
  });

  test("unauth for wrong user", async function () {
    const resp = await request(app)
        .post("/podcasts")
        .send(newPodcast)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/podcasts")
        .send({
          username: "user1",
          rating: 5,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/podcasts")
        .send({
          ...newPodcast,
          rating: "not-a-number",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /podcasts */

describe("GET /podcasts", function () {
  test("works w/o search term", async function () {
    const resp = await request(app)
      .get("/podcasts")
      .set("authorization", `Bearer ${u1Token}`)
    expect(resp.body).toEqual({
      podcasts:
          [
            {
              username: "user1",
              podcastId: '1',
              dateAdded: expect.any(String),
              rating: 1,
              notes: "notes 1",
            }
          ],
    });
  });

  test("works: search term", async function () {
    // add another pod
    const newSave = {
      username: "user1",
      podcastId: "4",
      data: {
        notes: "search term",
        rating: 4
      }
    };
    const save = await request(app)
      .post("/podcasts")
      .send(newSave)
      .set("authorization", `Bearer ${adminToken}`)
    expect(save.body).toEqual({"podcast": {
      username: 'user1',
      podcastId: '4',
      dateAdded: expect.any(String),  
      rating: 4,
      notes: "search term"
    }})
    // search for pod
    const resp = await request(app)
        .get("/podcasts")
        .send({username: 'user1'})
        .set("authorization", `Bearer ${u1Token}`)
        .query({ term: "search term" });
    expect(resp.body).toEqual({
      podcasts:
      [
        {
          username: "user1",
          podcastId: '4',
          dateAdded: expect.any(String),
          rating: 4,
          notes: "search term"
        }
      ]
    });
  });


  test("not found if no results from search", async function () {
    const resp = await request(app)
        .get("/podcasts")
        .query({ term: 'fjdkal'});
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /podcasts/:podcastId */

describe("GET /podcasts/:podcastId", function () {
  const newPodcast = {
    username: "user1",
    podcastId: "5",
    data: {
      notes: "notes",
      rating: 5
    }
  };
  test("works", async function () {
    const saved = await request(app)
      .post(`/podcasts`)
      .send(newPodcast)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
      .get(`/podcasts/${newPodcast.podcastId}`)
      .set("authorization", `Bearer ${u1Token}`)
    expect(resp.body).toEqual({
      podcast: {dateAdded: expect.any(String), username: 'user1', podcastId: '5', notes: 'notes', rating: 5},
    });
  });

  test("not found for unsaved pod", async function () {
    const resp = await request(app).get(`/podcasts/420`).set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /podcasts/:podcastId */

describe("PATCH /podcasts/:podcastId", function () {
  const newPodcast = {
    username: "user1",
    podcastId: "5",
    data: {
      notes: "notes",
      rating: 5
    }
  };
  test("works for correct user", async function () {
    const saved = await request(app)
      .post(`/podcasts`)
      .send(newPodcast)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
        .patch(`/podcasts/${newPodcast.podcastId}`)
        .send({
          notes: "edited",
        })
        .set("authorization", `Bearer ${u1Token}`)
    expect(resp.body).toEqual({
      podcast: {
        podcastId: '5',
        username: 'user1', 
        dateAdded: expect.any(String),
        rating: 5,
        notes: 'edited'
      },
    });
  });

  test("unauth for anon", async function () {
    const saved = await request(app)
      .post(`/podcasts`)
      .send(newPodcast)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
        .patch(`/podcasts/${saved.body.podcast.podcastId}`)
        .send({
          notes: "new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such podcast", async function () {
    const resp = await request(app)
        .patch(`/podcasts/420`)
        .send({
          notes: "nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on podcastId change attempt", async function () {
    const saved = await request(app)
      .post(`/podcasts`)
      .send(newPodcast)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
        .patch(`/podcasts/${saved.body.podcast.podcastId}`)
        .send({
          podcastId: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const saved = await request(app)
    .post(`/podcasts`)
    .send(newPodcast)
    .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
        .patch(`/podcasts/${saved.body.podcast.podcastId}`)
        .send({
          rating: "not-an-integer",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /podcasts/:handle */

describe("DELETE /podcasts/:podcastId", function () {
  const newPodcast = {
    username: "user1",
    podcastId: "5",
    data: {
      notes: "notes",
      rating: 5
    }
  };
  test("works for admin", async function () {
    const saved = await request(app)
      .post(`/podcasts`)
      .send(newPodcast)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
      .delete(`/podcasts/${saved.body.podcast.podcastId}`)
      .set("authorization", `Bearer ${adminToken}`)
      .send({username: 'user1'});
    expect(resp.body).toEqual({
      deleted: '5'
    });
  });

  test("works for correct user", async function () {
    const saved = await request(app)
      .post(`/podcasts`)
      .send(newPodcast)
      .set("authorization", `Bearer ${adminToken}`);
    const resp = await request(app)
      .delete(`/podcasts/${saved.body.podcast.podcastId}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      deleted: saved.body.podcast.podcastId
    });
  });

  test("unauth for incorrect user", async function () {
    try {
      const saved = await request(app)
        .post(`/podcasts`)
        .send(newPodcast)
        .set("authorization", `Bearer ${adminToken}`);
      const resp = await request(app)
        .delete(`/podcasts/${saved.body.podcast.podcastId}`)
        .set("authorization", `Bearer ${u2Token}`);
    }
    catch(err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth for anon", async function () {
    try {
      const saved = await request(app)
        .post(`/podcasts`)
        .send(newPodcast)
        .set("authorization", `Bearer ${adminToken}`);
      const resp = await request(app)
        .delete(`/podcasts/${saved.body.podcast.podcastId}`)
    }
    catch(err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("not found for no such podcast", async function () {
    try {
      const resp = await request(app)
        .delete(`/podcasts/999`)
        .set("authorization", `Bearer ${adminToken}`);
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
