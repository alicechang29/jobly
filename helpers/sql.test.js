import { describe, test, expect } from "vitest";

import { sqlForPartialUpdate } from "./sql.js";


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

  });

  test("checks datatype of returned object", function () {
    const updates = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(typeof updates.setCols).toBe('string');
    expect(Array.isArray(updates.values)).toBe(true);
  });

});




