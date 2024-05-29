import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import request from "supertest";

import app from "../app.js";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  u1Token as adminToken,
  u2Token
} from "./_testCommon.js";
import Job from "../models/jobs.js";


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 50000,
    equity: 0.1,
    companyHandle: "c1",
  };

  const noCompanyJob = {
    title: "new",
    salary: 50000,
    equity: 0.1,
    companyHandle: "not here",
  };

  test("ok for admin users", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
    });
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        company_handle: "c1"
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        ...newCompany,
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request company doesn't exist", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(noCompanyJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {

  test("ok for anonymous user", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [
          {
            title: "j1",
            salary: 50000,
            equity: 0.1,
            companyHandle: "c1",
          },
          {
            title: "j2",
            salary: 60000,
            equity: 0.2,
            companyHandle: "c2",
          }
        ],
    });
  });
});
describe("GET /jobs", function () {

  test("Filters by similar title",
    async function () {
      const resp = await request(app)
        .get("/jobs")
        .query({
          title: "J"
        });

      expect(resp.body).toEqual({
        companies:
          [
            {
              title: "j1",
              salary: 50000,
              equity: 0.1,
              companyHandle: "c1",
            },
            {
              title: "j2",
              salary: 60000,
              equity: 0.2,
              companyHandle: "c2",
            }
          ]
      }

      );
      expect(resp.statusCode).toEqual(200);
    });

  test("Throws 400 error if request query contains invalid fields",
    async function () {
      const resp = await request(app)
        .get("/companies")
        .query({
          corn: 1
        });

      expect(resp.statusCode).toEqual(400);

      expect(resp.body.error.message).toEqual(
        [
          "instance is not allowed to have the additional property \"corn\""
        ]

      );

    });

  test("Throws 400 error if salary is NaN",
    async function () {
      const resp = await request(app)
        .get("/companies")
        .query({
          salary: "corn"
        });

      expect(resp.statusCode).toEqual(400);

      expect(resp.body.error.message).toEqual([
        "instance.minEmployees is not of a type(s) integer"
      ]);
    });

  test("Throws 400 error if equity is not True or False",
    async function () {
      const resp = await request(app)
        .get("/companies")
        .query({
          equity: "corn"
        });

      expect(resp.statusCode).toEqual(400);

      expect(resp.body.error.message).toEqual([
        "instance.equity is not of a type(s) boolean"
      ]);
    });

});



// /************************************** GET /companies/:handle */

// describe("GET /companies/:handle", function () {
//   test("works for anon", async function () {
//     const resp = await request(app).get(`/companies/c1`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("works for anon: company w/o jobs", async function () {
//     const resp = await request(app).get(`/companies/c2`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//     });
//   });

//   test("not found for no such company", async function () {
//     const resp = await request(app).get(`/companies/nope`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });

// /************************************** PATCH /companies/:handle */

// describe("PATCH /companies/:handle", function () {
//   test("works for admin users", async function () {
//     const resp = await request(app)
//       .patch(`/companies/c1`)
//       .send({
//         name: "C1-new",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1-new",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("unauth for non-admin user", async function () {
//     const resp = await request(app)
//       .patch(`/companies/c1`)
//       .send({
//         name: "C1-new",
//       })
//       .set("authorization", `Bearer ${u2Token}`);;
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//       .patch(`/companies/c1`)
//       .send({
//         name: "C1-new",
//       });
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found on no such company", async function () {
//     const resp = await request(app)
//       .patch(`/companies/nope`)
//       .send({
//         name: "new nope",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request on handle change attempt", async function () {
//     const resp = await request(app)
//       .patch(`/companies/c1`)
//       .send({
//         handle: "c1-new",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request on invalid data", async function () {
//     const resp = await request(app)
//       .patch(`/companies/c1`)
//       .send({
//         logoUrl: "not-a-url",
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

// /************************************** DELETE /companies/:handle */

// describe("DELETE /companies/:handle", function () {
//   test("works for admin users", async function () {
//     const resp = await request(app)
//       .delete(`/companies/c1`)
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({ deleted: "c1" });
//   });

//   test("unauth for non-admin users", async function () {
//     const resp = await request(app)
//       .delete(`/companies/c1`)
//       .set("authorization", `Bearer ${u2Token}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//       .delete(`/companies/c1`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found for no such company", async function () {
//     const resp = await request(app)
//       .delete(`/companies/nope`)
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   //TODO: add case for deleting company that doesn't exist as a non-admin user - check if it's the right error
// });
