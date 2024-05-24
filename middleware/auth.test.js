import { describe, test, expect } from "vitest";
import jwt from "jsonwebtoken";

import { UnauthorizedError } from "../expressError.js";
import {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  userCheck
} from "./auth.js";
import { SECRET_KEY } from "../config.js";

const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");
const adminJwt = jwt.sign({ username: "adminTest", isAdmin: true }, SECRET_KEY);

function next(err) {
  if (err) throw new Error("Got error from middleware");
}

describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });
});


describe("ensureAdmin", function () {
  test("works", function () {
    const req = {};
    const res = {
      locals: {
        user: {
          username: "adminTest",
          isAdmin: true
        }
      }
    };

    ensureAdmin(req, res, next);
  });

  test("unauth if not admin", function () {
    const req = {};
    const res = {
      locals: {
        user: {
          username: "test",
          isAdmin: "false"
        }
      }
    };
    expect(() => ensureAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });
});

//FIXME: not sure if these work
describe("checkUserIdentity", function () {
  test("username param matches user identity", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test" } } };
    userCheck(req, res, next);
  });

  test("username param does not matche user identity", function () {
    const req = { params: { username: "corn" } };
    const res = { locals: {} };
    ensureAdmin(req, res, next);

  });
});