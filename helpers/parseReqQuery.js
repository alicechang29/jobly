import { BadRequestError } from "../expressError.js";

/**Given req.query object with string values,
 * parses values into correct data types and returns as object
 * Example Input:
    {
      nameLike: 'a',
      minEmployees: '250',
      maxEmployees: '500'
    }
 * Example Output:
    {
      nameLike: 'a',
      minEmployees: 250,
      maxEmployees: 500
    }

 */
function parseReqQuery(reqQuery) {

  if ("minEmployees" in reqQuery) {
    reqQuery.minEmployees = Number(reqQuery.minEmployees);

  }

  if ("maxEmployees" in reqQuery) {
    reqQuery.maxEmployees = Number(reqQuery.maxEmployees);
  }

  if ("maxEmployees" in reqQuery && "minEmployees" in reqQuery) {
    if (reqQuery.minEmployees > reqQuery.maxEmployees) {
      throw new BadRequestError("min needs to be less than max input");
    }
  }

  console.log("parse", reqQuery);
  return reqQuery;

}

export { parseReqQuery };