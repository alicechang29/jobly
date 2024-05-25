import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";
import { sqlForPartialUpdate } from "../helpers/sql.js";

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const companyCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [companyHandle]);

    if (!companyCheck.rows[0])
      throw new BadRequestError(`${companyHandle} doesn't exist.`);

    const result = await db.query(`
                INSERT INTO jobs (
                                  title,
                                  salary,
                                  equity,
                                  company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                        id,
                        title,
                        salary,
                        equity,
                        company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(`
        SELECT  id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
        FROM jobs
        ORDER BY id`);
    return jobsRes.rows;
  }

  /** Given a constructed where clause object that contains:
   * {whereClause, values}
   *
   * Returns an array of job instances that match the
   * search query: [{job1}, {job2}, ...]
  */

  static async getJobsBySearch(whereClauseValues) {

    const jobsRes = await db.query(`
        SELECT  id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
        FROM jobs
        WHERE ${whereClauseValues.whereClause}
        ORDER BY id`,
      whereClauseValues.values
    );

    return jobsRes.rows;
  }

  /**Constructs a WHERE clause for SQL statements based on
   * user inputs.
   *  {
        title: 'manager',
        minSalary: '70000',
        hasEquity: 'true'
      }
   * Outputs: a WHERE clause SQL statement object that can be passed to
      query job model
      {
        whereClause: '"title" ILIKE $1 AND "salary" >= $2
          AND "equity" > $3',
        values: ['manager', 70000, 0]
      }
   */

  //FIXME: THIS IS WRONG
  static constructWhereClause(filteredData) {
    const keys = Object.keys(filteredData);

    let whereClause = [];
    const values = [];

    let i = 0;

    while (i < keys.length) {
      if ("title" in filteredData) {
        whereClause.push(`"title" ILIKE $${i + 1}`);
        values.push("%" + filteredData.title + "%");
        i++;
      }
      if ("minSalary" in filteredData) {
        whereClause.push(`"salary" >=$${i + 1}`);
        values.push(filteredData.minSalary);
        i++;
      }

      if (filteredData.hasEquity === true) {
        whereClause.push(`"equity" >$${i + 1}`);
        values.push(0);
        i++;
      }
    }

    whereClause = whereClause.join(" AND ");

    return {
      whereClause,
      values
    };

  }

  /** Given a job id, return data about the job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(`
        SELECT  id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data,
      { title: "title" }
    );
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING
                id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(`
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


export default Job;