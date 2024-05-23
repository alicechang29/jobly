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
  //TODO: relation between values is determined within the model.
  //Routes only care about validating if the data type is correct
  // Move validation check into model -- can move json schema validator into model
  //no logic would be done in the route if ^^^ (don't do this right now )
  if ("maxEmployees" in reqQuery && "minEmployees" in reqQuery) {
    if (reqQuery.minEmployees > reqQuery.maxEmployees) {
      throw new BadRequestError("min needs to be less than max input");
    }
  }

  console.log("parse", reqQuery);
  return reqQuery;

}

export { parseReqQuery };