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
  u1Token,
} from "./_testCommon.js";
import Company from "../models/company";



beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  test("ok for users", async function () {
    const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: newCompany,
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        handle: "new",
        numEmployees: 10,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        ...newCompany,
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /companies", function () {

  test("ok for anonymous user", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies:
        [
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
        ],
    });
  });
});
describe("GET /companies", function () {
  beforeEach(async function () {
    await Company.create(
      {
        handle: "dishnetwork",
        name: "Dish Network",
        description: "tv company",
        numEmployees: 38,
        logoUrl: "http://dn.img"
      });

    await Company.create(
      {
        handle: "dishnettv",
        name: "Dish Net TV",
        description: "another tv company",
        numEmployees: 10,
        logoUrl: "http://adn.img"
      });
  });

  //FIXME: why isn't this working
  // afterEach(async function () {
  //   await db.query("ROLLBACK");
  // });

  test("Filters by similar company name",
    async function () {
      const resp = await request(app)
        .get("/companies")
        .query({
          nameLike: "dish net",
          minEmployees: 0,
          maxEmployees: 50
        });

      expect(resp.body).toEqual({
        companies:
          [
            {
              handle: "dishnettv",
              name: "Dish Net TV",
              description: "another tv company",
              numEmployees: 10,
              logoUrl: "http://adn.img"
            },
            {
              handle: "dishnetwork",
              name: "Dish Network",
              description: "tv company",
              numEmployees: 38,
              logoUrl: "http://dn.img"
            }
          ]
      }

      );

      expect(resp.statusCode).toEqual(200);

    });

  test("Throws 400 error if minEmployee > maxEmployee input",
    async function () {
      const resp = await request(app)
        .get("/companies")
        .query({
          nameLike: "dish net",
          minEmployees: 50,
          maxEmployees: 10
        });

      expect(resp.statusCode).toEqual(400);

      expect(resp.body.error.message).toEqual(
        "min needs to be less than max input"
      );

    });

  test("Throws 400 error if minEmployee or maxEmployee is not a positive int",
    async function () {
      const resp = await request(app)
        .get("/companies")
        .query({
          nameLike: "dish net",
          minEmployees: -30,
          maxEmployees: "hi"
        });

      expect(resp.statusCode).toEqual(400);

      expect(resp.body.error.message).toEqual([
        "instance.minEmployees must be greater than or equal to 0",
        "instance.maxEmployees is not of a type(s) integer"
      ]);

    });

  test("Throws 400 error if request query contains invalid fields",
    async function () {
      const resp = await request(app)
        .get("/companies")
        .query({
          nameLike: "dish net",
          minEmployees: -30,
          corn: 1
        });

      expect(resp.statusCode).toEqual(400);

      expect(resp.body.error.message).toEqual(
        [
          "instance.minEmployees must be greater than or equal to 0",
          "instance is not allowed to have the additional property \"corn\""
        ]

      );

    });

  test("Throws 400 error if min employee is NaN",
    async function () {
      const resp = await request(app)
        .get("/companies")
        .query({
          nameLike: "dish net",
          minEmployees: "corn",
        });

      expect(resp.statusCode).toEqual(400);

      expect(resp.body.error.message).toEqual([
        "instance.minEmployees is not of a type(s) integer"
      ]);
    });

});



/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for users", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        name: "C1-new",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such company", async function () {
    const resp = await request(app)
      .patch(`/companies/nope`)
      .send({
        name: "new nope",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        handle: "c1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for users", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/companies/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/companies/nope`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
