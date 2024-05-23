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

  test("checks datatype of returned object", function () {

    const reqQuery = {
      nameLike: 'a',
      minEmployees: '250',
      maxEmployees: '500'
    };

    const whereClauseValues = constructWhereClause(reqQuery);

    expect(typeof whereClauseValues.whereClause).toBe('string');
    expect(Array.isArray(whereClauseValues.values)).toBe(true);

  });

  test("construct where clause with only 1 input", function () {

    const reqQuery = { nameLike: 'a' };

    const whereClauseValues = constructWhereClause(reqQuery);

    expect(whereClauseValues.whereClause).toEqual('"name" ILIKE $1');

  });

  test("construct where clause with 3 inputs", function () {

    const reqQuery = {
      nameLike: 'a',
      minEmployees: '250',
      maxEmployees: '500'
    };

    const whereClauseValues = constructWhereClause(reqQuery);

    expect(whereClauseValues.whereClause).toEqual(
      '"name" ILIKE $1 AND "num_employees" >=$2 AND "num_employees" <=$3'
    );

  });

});


