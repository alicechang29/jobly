import { describe, test, expect } from "vitest";

import { sqlForPartialUpdate, constructWhereClause } from "./sql.js";


describe("sqlForPartialUpdate", function () {
  const dataToUpdate = { firstName: 'Aliya', age: 32 };
  const jsToSql = {
    firstName: "first_name",
    lastName: "last_name",
    isAdmin: "is_admin",
  };

  test("returns a correctly converted object", function () {
    const updates = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(updates).toEqual(
      {
        "setCols": '"first_name"=$1, "age"=$2',
        "values": ["Aliya", 32]
      }
    );

    expect(updates.setCols).toContain('$');

  });

  test("checks for setCols to contain parameterized queries", function () {
    const updates = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(updates.setCols).toContain('$');

  });

  test("checks datatype of returned object", function () {
    const updates = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(typeof updates.setCols).toBe('string');
    expect(Array.isArray(updates.values)).toBe(true);
  });

});


describe("constructWhereClause", function () {
  const reqQuery = { nameLike: 'a', minEmployees: '250', maxEmployees: '500' };
  const jsToSql = {
    nameLike: "name",
  };

  test("checks datatype of returned object", function () {
    const sqlUpdated = sqlForPartialUpdate(
      parsedReqQuery(reqQuery),
      jsToSql
    );

    const whereClause = constructWhereClause(sqlUpdated);

    const filterQuery = {
      whereClause, sqlUpdated
    };

    expect(typeof filterQuery.whereClause).toBe('string');
    expect(typeof filterQuery.sqlUpdated).toBe('object');

    /* FIXME: I WANT THIS:::
    return {
      whereClause: 'name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3',
      sqlUpdated: {
        setCols: '"name"=$1, "num_employees" >=$2, "num_employees <= $3',
        values: ['a', 250, 500]
      }
    };
    */
  });

});


