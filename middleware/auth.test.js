import { describe, test, expect } from "vitest";
import jwt from "jsonwebtoken";

import { UnauthorizedError } from "../expressError.js";
import {
  authenticateJWT,
  ensureLoggedIn,
  ensureLoggedInAdmin,
  ensureCorrectUserOrAdmin
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


describe("ensureLoggedInAdmin", function () {
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

    ensureLoggedInAdmin(req, res, next);
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
    expect(() => ensureLoggedInAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureLoggedInAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });
});


describe("ensureCorrectUserOrAdmin", function () {
  test("auth if matching user identity", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test" } } };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("auth if admin and not matching user identity",
    function () {
      const req = { params: { username: "test" } };
      const res = { locals: { user: { username: "notTest", isAdmin: true } } };
      ensureCorrectUserOrAdmin(req, res, next);
    });

  test("unauth if not admin and not matching user identity",
    function () {
      const req = { params: { username: "corn" } };
      const res = { locals: { user: { isAdmin: false } } };
      expect(() => ensureCorrectUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);

    });

  test("unauth if no valid login", function () {
    const req = { params: { username: "corn" } };
    const res = { locals: { user: {} } };
    expect(() => ensureCorrectUserOrAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });


});