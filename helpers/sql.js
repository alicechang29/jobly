import { BadRequestError } from "../expressError.js";


/** Given an object, dataToUpdate, ({firstName: 'Aliya', age: 32})
 * and an an object (jsToSql) containing the conversion of variable names
 * written in  camelCase to snake_case,
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

export { sqlForPartialUpdate };
