import bcrypt from "bcrypt";
import db from "../db.js";
import { BCRYPT_WORK_FACTOR } from "../config.js";

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM jobs");

  await db.query(`
      INSERT INTO companies(handle, name, num_employees, description, logo_url)
      VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
             ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
             ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  await db.query(`
      INSERT INTO users(username,
                        password,
                        first_name,
                        last_name,
                        email)
      VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
             ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
      RETURNING username`, [
    await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
  ]);

  await db.query(`
      INSERT INTO jobs(id, title, salary, equity, company_handle)
      VALUES ('1', 'J1', 100, 0.1, 'c1'),
             ('2', 'J2', 200, 0.2, 'c1'),
             ('3', 'J3', 300, 0.3, 'c2')`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};