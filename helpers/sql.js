import { BadRequestError } from "../expressError.js";
import { parseReqQuery } from "./parseReqQuery.js";


/** Given an object, dataToUpdate, ({firstName: 'Aliya', age: 32})
 * and an an object, jsToSql, containing the conversion of variable names
 * ({first_name: firstName}), matching snake_case to camelCase.
 *
 * Converts each key's value within dataToUpdate into a parameterized query
 * variable to protect against SQL injection.
 *
 * Returns an object with:
    {
      setCols: '"first_name"=$1, "age"=$2',
      values: ['Aliya', 32]
    }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


/**Constructs a WHERE clause for SQL statements based on
 * user inputs.
 *  {
      nameLike: 'a',
      minEmployees: '250',
      maxEmployees: '500'
    }
 * Outputs: a WHERE clause SQL statement object that can be passed to
    query company model
    {
      whereClause: '"name" ILIKE $1 AND "num_employees" >= $2
        AND "num_employees" <= $3',
      values: ['a', 250, 500]
    }

 */
function constructWhereClause(reqQuery) {

  const parsedData = parseReqQuery(reqQuery);

  const keys = Object.keys(parsedData);

  let whereClause = [];
  const values = [];

  let i = 0;

  while (i < keys.length) {
    if ("nameLike" in parsedData) {
      whereClause.push(`"name" ILIKE $${i + 1}`);
      values.push("%" + parsedData.nameLike + "%");
      i++;
    }
    if ("minEmployees" in parsedData) {
      whereClause.push(`"num_employees" >=$${i + 1}`);
      values.push(parsedData.minEmployees);
      i++;
    }
    if ("maxEmployees" in parsedData) {
      whereClause.push(`"num_employees" <=$${i + 1}`);
      values.push(parsedData.maxEmployees);
      i++;
    }
  }

  whereClause = whereClause.join(" AND ");

  return {
    whereClause,
    values
  };

}

export { sqlForPartialUpdate, constructWhereClause };
