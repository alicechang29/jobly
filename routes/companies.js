/** Routes for companies. */

import jsonschema from "jsonschema";
import { Router } from "express";

import { BadRequestError } from "../expressError.js";
import { ensureLoggedIn, ensureLoggedInAdmin } from "../middleware/auth.js";
import Company from "../models/company.js";
import compNewSchema from "../schemas/compNew.json" with { type: "json" };
import compUpdateSchema from "../schemas/compUpdate.json" with { type: "json" };
import compFilterSchema from "../schemas/compFilter.json" with { type: "json" };
import { parseReqQuery } from "../helpers/parseReqQuery.js";

const router = new Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: logged in admin
 */

router.post("/", ensureLoggedInAdmin, async function (req, res, next) {

  const validator = jsonschema.validate(
    req.body,
    compNewSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.create(req.body);
  return res.status(201).json({ company });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 * Get all companies if no filter parameters provided.
 *
 * Can filter companies based on provided filter parameters.
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {

  let companies;

  if (Object.keys(req.query).length === 0) {

    companies = await Company.findAll();
    return res.json({ companies });

  }

  const parsedQuery = parseReqQuery(req.query);

  const result = jsonschema.validate(
    parsedQuery, compFilterSchema, { required: true });

  if (!result.valid) {
    const errs = result.errors.map(err => err.stack);
    throw new BadRequestError(errs);
  }

  const constructedWhereClause = Company.constructWhereClause(parsedQuery);

  companies = await Company.getCompaniesBySearch(constructedWhereClause);

  return res.json({ companies });

});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  const company = await Company.get(req.params.handle);
  return res.json({ company });
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: logged in admin
 */

router.patch("/:handle", ensureLoggedInAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    compUpdateSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.update(req.params.handle, req.body);
  return res.json({ company });
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: logged in admin
 */

router.delete("/:handle", ensureLoggedInAdmin, async function (req, res, next) {
  await Company.remove(req.params.handle);
  return res.json({ deleted: req.params.handle });
});


export default router;
