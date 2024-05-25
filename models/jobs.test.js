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

  // test("create job for company that exists", async function () {
  //   let job = await Job.create(newJob);
  //   expect(job).toEqual(newJob);

  //   const result = await db.query(
  //     `SELECT id, title, salary, equity, company_handle AS companyHandle
  //      FROM jobs
  //      WHERE company_handle = 'c1'
  //      ORDER BY id DESC`);

  //   //FIXME: why is this expect.any(Number) not working???
  //   expect(result.rows[0]).toEqual([
  //     {
  //       id: expect.any(Number),
  //       title: "manager",
  //       salary: 100000,
  //       equity: "0",
  //       companyHandle: "c1"
  //     }
  //   ]);
  // });

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

});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: 1,
        title: "J1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1"
      },
      {
        id: 2,
        title: "J2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c1"
      },
      {
        id: 3,
        title: "J3",
        salary: 300,
        equity: "0.3",
        companyHandle: "c2"
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "J1",
      salary: 100,
      equity: "0.1",
      companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(99);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** get with filtering */
// describe("get with filtering ", function () {
//   test("works", async function () {
//     const parsedData = Job.constructWhereClause({ minSalary: 250 });

//     const jobs = await Job.getJobsBySearch(parsedData);


//     expect(jobs).toEqual([
//       {
//         id: 3,
//         title: "J3",
//         salary: 300,
//         equity: .3,
//         companyHandle: "c2"
//       }
//     ]);
//   });
// });

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "Boss",
    salary: 500,
    equity: .5
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      title: "Boss",
      salary: 500,
      equity: "0.5",
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
       FROM jobs
       WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "Boss",
      salary: 500,
      equity: "0.5",
      companyHandle: "c1"
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New Boss",
      salary: null,
      equity: null,
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls,
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
      FROM jobs
      WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "New Boss",
      salary: null,
      equity: null,
      companyHandle: "c1"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(99, updateData);
      throw new Error("fail test, you shouldn't get here");

    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
      "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(99);
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
      title: 'J',
      minSalary: '100',
      hasEquity: 'true'
    };

    const parsedData = parseReqQuery(reqQuery);

    const whereClauseValues = Job.constructWhereClause(parsedData);

    expect(typeof whereClauseValues.whereClause).toBe('string');
    expect(Array.isArray(whereClauseValues.values)).toBe(true);

  });

  // test("construct where clause with only 1 input", async function () {

  //   const reqQuery = { nameLike: 'j' };

  //   const parsedData = parseReqQuery(reqQuery);

  //   const whereClauseValues = Job.constructWhereClause(parsedData);

  //   expect(whereClauseValues).toEqual({
  //     whereClause: '"title" ILIKE $1',
  //     values: ["%j%"]
  //   });

  // });

  test("construct where clause with 3 inputs", async function () {

    const reqQuery = {
      title: 'J',
      minSalary: '100',
      hasEquity: 'true'
    };

    const parsedData = parseReqQuery(reqQuery);

    const whereClauseValues = Job.constructWhereClause(parsedData);

    expect(whereClauseValues).toEqual(
      {
        whereClause:
          '"title" ILIKE $1 AND "salary" >=$2 AND "equity" >$3',
        values: ["%J%", 100, 0]
      }
    );


  });
});