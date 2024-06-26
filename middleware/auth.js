/** Convenience middleware to handle common auth cases in routes. */

import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config.js";
import { UnauthorizedError } from "../expressError.js";


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (res.locals.user?.username) return next();
  throw new UnauthorizedError();
}

/** Middleware to use when user must be a logged in admin.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedInAdmin(req, res, next) {
  const currUser = res.locals.user;

  if (currUser?.username && currUser?.isAdmin === true) {
    return next();
  }

  throw new UnauthorizedError();
}

/** Middleware to check if logged in user matches the username in the route or if
 * the user is an admin.
 *
 * If not, raises Unauthorized.
 */

function ensureCorrectUserOrAdmin(req, res, next) {
  const currUser = res.locals.user;

  if (
    currUser?.username === req.params.username ||
    currUser?.username && currUser?.isAdmin === true
  ) {
    return next();
  }

  throw new UnauthorizedError();

}


export {
  authenticateJWT,
  ensureLoggedIn,
  ensureLoggedInAdmin,
  ensureCorrectUserOrAdmin
};
