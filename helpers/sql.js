import { BadRequestError } from "../expressError.js";


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


/**FIXME: Constructs a WHERE clause for SQL statements based on
 * user inputs.
 *  {
      nameLike: 'a',
      minEmployees: '250',
      maxEmployees: '500'
    }
 * Outputs: a WHERE clause SQL statement that can be passed
    {
      whereClause: 'name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3',
      sqlUpdated: {
        setCols: '"name"=$1, "num_employees" >=$2, "num_employees <= $3',
        values: ['a', 250, 500]
    }

 */
function constructWhereClause(filters) {






}

export { sqlForPartialUpdate, constructWhereClause };
