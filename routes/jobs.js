/** Routes for jobs. */

import jsonschema from "jsonschema";
import { Router } from "express";

import { BadRequestError } from "../expressError.js";
import { ensureLoggedIn, ensureLoggedInAdmin } from "../middleware/auth.js";
import Job from "../models/jobs.js";
import jobNewSchema from "../schemas/compNew.json" with { type: "json" };
import jobUpdateSchema from "../schemas/compUpdate.json" with { type: "json" };
import jobFilterSchema from "../schemas/compFilter.json" with { type: "json" };
import { parseReqQuery } from "../helpers/parseReqQuery.js";

const router = new Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { title, salary, equity, companyHandle }
 *
 * Authorization required: logged in Admin
 */

router.post("/", ensureLoggedInAdmin, async function (req, res, next) {

  const validator = jsonschema.validate(
    req.body,
    jobNewSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});