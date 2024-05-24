import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";

import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";
import { parseReqQuery } from "../helpers/parseReqQuery.js";

import Job from "./jobs.js";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
} from "./_testCommon.js";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "manager",
    salary: 100000,
    equity: 0,
    companyHandle: "c1"
  };

  test("create job for company that exists", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS companyHandle
       FROM jobs
       WHERE company_handle = 'c1'`);
    expect(result.rows).toEqual([
      {
        id: 1,
        title: "manager",
        salary: 100000,
        equity: 0,
        companyHandle: "c1"
      },
    ]);
  });

  test("401, create job for company that doesn't exist",
    async function () {
      const failJob = {
        title: "manager",
        salary: 100000,
        equity: 0,
        companyHandle: "noCompany"
      };

      try {
        await Job.create(failJob);
        throw new Error("fail test, you shouldn't get here");
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });


  //FIXME: everything below, only Create tests written.


});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let companies = await Company.findAll();
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let company = await Company.get("c1");
    expect(company).toEqual({
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Company.get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** get with filtering */
describe("get with filtering ", function () {
  test("works", async function () {
    const parsedData = Company.constructWhereClause({ maxEmployees: 2 });

    const companies = await Company.getCompaniesBySearch(parsedData);


    expect(companies).toEqual([
      {
        handle: 'c1',
        name: 'C1',
        numEmployees: 1,
        description: 'Desc1',
        logoUrl: 'http://c1.img'
      },
      {
        handle: 'c2',
        name: 'C2',
        numEmployees: 2,
        description: 'Desc2',
        logoUrl: 'http://c2.img'
      }
    ]

    );

  });

});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New",
    description: "New Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.update("c1", updateData);
    expect(company).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
       FROM companies
       WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: 10,
      logo_url: "http://new.img",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    };

    let company = await Company.update("c1", updateDataSetNulls);
    expect(company).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
       FROM companies
       WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: null,
      logo_url: null,
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Company.update("nope", updateData);
      throw new Error("fail test, you shouldn't get here");

    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update("c1", {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Company.remove("c1");
    const res = await db.query(
      "SELECT handle FROM companies WHERE handle='c1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Company.remove("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/************************************** whereClause constructor method */

describe("constructWhereClause", function () {

  test("checks datatype of returned object", async function () {

    const reqQuery = {
      nameLike: 'a',
      minEmployees: '250',
      maxEmployees: '500'
    };

    const parsedData = parseReqQuery(reqQuery);

    const whereClauseValues = await Company.constructWhereClause(parsedData);

    expect(typeof whereClauseValues.whereClause).toBe('string');
    expect(Array.isArray(whereClauseValues.values)).toBe(true);

  });

  test("construct where clause with only 1 input", async function () {

    const reqQuery = { nameLike: 'a' };

    const parsedData = parseReqQuery(reqQuery);

    const whereClauseValues = await Company.constructWhereClause(parsedData);

    expect(whereClauseValues).toEqual({
      whereClause: '"name" ILIKE $1',
      values: ["%a%"]
    });

  });

  test("construct where clause with 3 inputs", async function () {

    const reqQuery = {
      nameLike: 'a',
      minEmployees: '250',
      maxEmployees: '500'
    };

    const parsedData = parseReqQuery(reqQuery);

    const whereClauseValues = await Company.constructWhereClause(parsedData);

    expect(whereClauseValues).toEqual(
      {
        whereClause:
          '"name" ILIKE $1 AND "num_employees" >=$2 AND "num_employees" <=$3',
        values: ["%a%", 250, 500]
      }
    );


  });
});