import { describe, test, expect } from "vitest";

import { parseReqQuery } from "./parseReqQuery.js";

const reqQuery = {
  nameLike: 'a',
  minEmployees: '250',
  maxEmployees: '500'
};

describe("parseReqQuery", function () {

  test("returns object with correctly parsed data types", function () {
    const parsedObj = parseReqQuery(reqQuery);

    expect(parsedObj).toEqual(
      {
        nameLike: 'a',
        minEmployees: 250,
        maxEmployees: 500
      }
    );

    expect(typeof parsedObj.nameLike).toBe('string');
    expect(typeof parsedObj.minEmployees).toBe('number');
    expect(typeof parsedObj.maxEmployees).toBe('number');

  });

});
