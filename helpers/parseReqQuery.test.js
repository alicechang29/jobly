import { describe, test, expect } from "vitest";
import { BadRequestError } from "../expressError.js";
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

  });

  test("400 if min input value is > than max input value", function () {
    const data = {
      nameLike: "dish net",
      minEmployees: "50",
      maxEmployees: "10"
    };

    try {
      parseReqQuery(data);
      throw new Error("fail test, you shouldn't get here");

    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toEqual("min needs to be less than max input");
    }

  });

});
