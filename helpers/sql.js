import { BadRequestError } from "../expressError.js";


/** Given an object, dataToUpdate, ({firstName: 'Aliya', age: 32})
 * and an an object, jsToSql, containing the conversion of variable names
 * ({first_name: firstName}), matching snake_case to camelCase.
 *
 * Creates an object where each key's value from dataToUpdate is turned
 * into a parameterized query for use inside a prepared set statement
 * along with an array of values to match to protect against SQL injection.
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



export { sqlForPartialUpdate };
