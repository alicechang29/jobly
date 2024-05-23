import { BadRequestError } from "../expressError.js";

/**Given req.query object with string values,
 * parses values into correct data types and returns as object
 */
function parseReqQuery(reqQuery) {

  if ("minEmployees" in reqQuery) {
    reqQuery.minEmployees = Number(reqQuery.minEmployees);
  }

  if ("maxEmployees" in reqQuery) {
    reqQuery.maxEmployees = Number(reqQuery.maxEmployees);
  }
  console.log("parse", reqQuery);
  return reqQuery;

}

export { parseReqQuery };