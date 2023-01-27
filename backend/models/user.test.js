"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(async () => {await commonBeforeAll()});
beforeEach(async () => {await commonBeforeEach()});
afterEach(async () => {await commonAfterEach()});
afterAll(async () => {await commonAfterAll()});


/**************************************** authenticate */
describe('authenticate user', function() {
  test('works for authorized user', async function(){
    const auth = await User.authenticate('user1', 'password1');
    expect(auth).toEqual({username: 'user1', email: 'u1@gmail.com', firstName: 'first1', lastName: 'last1', isAdmin: true})
  })

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("user1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
})



/************************************** register */
describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "Test",
    lastName: "Tester",
    email: "test@test.com",
    isAdmin: false,
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual(newUser);
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("works: adds admin", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
      isAdmin: true,
    });
    expect(user).toEqual({ ...newUser, isAdmin: true });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


/************************************** findAll */
describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
      {
        username: "user1",
        firstName: "first1",
        lastName: "last1",
        email: "u1@gmail.com",
        isAdmin: true,
      },
      {
        username: "user2",
        firstName: "first2",
        lastName: "last2",
        email: "u2@gmail.com",
        isAdmin: false,
      },
      {
        username: "user3",
        firstName: "first3",
        lastName: "last3",
        email: "u3@gmail.com",
        isAdmin: false,
      }
    ]);
  });
});


/************************************** get */
describe("get", function () {
  test("works", async function () {
    let user = await User.get("user1");
    expect(user).toEqual({
      username: "user1",
      firstName: "first1",
      lastName: "last1",
      email: "u1@gmail.com",
      isAdmin: true,
      podcasts: ['1','2'],
      episodes: ['1','2']
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});



/************************************** update */
describe("update", function () {
  const updateData = {
    firstName: "NewF",
    lastName: "NewL",
    email: "new@gmail.com",
    isAdmin: true,
  };

  test("works", async function () {
    let user = await User.update("user1", updateData);
    expect(user).toEqual({
      username: "user1",
      ...updateData,
    });
  });

  test("works: set password", async function () {
    let user = await User.update("user1", {
      password: "new",
    });
    expect(user).toEqual({
      username: "user1",
      firstName: "first1",
      lastName: "last1",
      email: "u1@gmail.com",
      isAdmin: true,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'user1'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("not found if no such user", async function () {
    try {
      await User.update("nope", {
        firstName: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    expect.assertions(1);
    try {
      await User.update("user1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});



/************************************** remove */
describe("remove", function () {
  test("works", async function () {
    await User.remove("user1");
    const res = await db.query(
        "SELECT * FROM users WHERE username='user1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
