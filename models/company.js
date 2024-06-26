import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";
import { sqlForPartialUpdate } from "../helpers/sql.js";

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(`
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`, [
      handle,
      name,
      description,
      numEmployees,
      logoUrl,
    ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ORDER BY name`);
    return companiesRes.rows;
  }

  /** Given a constructed where clause object that contains:
   * {whereClause, values}
   *
   * Returns an array of company instances that match the
   * search query: [{company1}, {company2}, ...]
  */

  static async getCompaniesBySearch(whereClauseValues) {

    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees  AS "numEmployees",
               logo_url       AS "logoUrl"
        FROM companies
        WHERE ${whereClauseValues.whereClause}
        ORDER BY name`,
      whereClauseValues.values
    );

    return companiesRes.rows;
  }

  /**Constructs a WHERE clause for SQL statements based on
   * user inputs.
   *  {
        nameLike: 'a',
        minEmployees: '250',
        maxEmployees: '500'
      }
   * Outputs: a WHERE clause SQL statement object that can be passed to
      query company model
      {
        whereClause: '"name" ILIKE $1 AND "num_employees" >= $2
          AND "num_employees" <= $3',
        values: ['a', 250, 500]
      }
   */
  static constructWhereClause(filteredData) {
    const keys = Object.keys(filteredData);

    let whereClause = [];
    const values = [];

    let i = 0;

    while (i < keys.length) {
      if ("nameLike" in filteredData) {
        whereClause.push(`"name" ILIKE $${i + 1}`);
        values.push("%" + filteredData.nameLike + "%");
        i++;
      }
      if ("minEmployees" in filteredData) {
        whereClause.push(`"num_employees" >=$${i + 1}`);
        values.push(filteredData.minEmployees);
        i++;
      }
      if ("maxEmployees" in filteredData) {
        whereClause.push(`"num_employees" <=$${i + 1}`);
        values.push(filteredData.maxEmployees);
        i++;
      }
    }

    whereClause = whereClause.join(" AND ");

    return {
      whereClause,
      values
    };

  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`, [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE companies
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(`
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`, [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


export default Company;