const pool = require("../database/")

/* ****************************************
 *  Add new review
 * *************************************** */
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = `
      INSERT INTO review (review_text, inv_id, account_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const data = await pool.query(sql, [review_text, inv_id, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("addReview error", error)
    throw error
  }
}

/* ****************************************
 *  Get reviews for a vehicle (newest first)
 * *************************************** */
async function getReviewsByInvId(inv_id) {
  try {
    const sql = `
      SELECT r.review_id,
             r.review_text,
             r.review_date,
             r.account_id,
             a.account_firstname,
             a.account_lastname
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByInvId error", error)
    throw error
  }
}

/* ****************************************
 *  Get all reviews written by an account
 * *************************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT r.review_id,
             r.review_text,
             r.review_date,
             r.inv_id,
             i.inv_make,
             i.inv_model,
             i.inv_year
      FROM review r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC
    `
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByAccountId error", error)
    throw error
  }
}

/* ****************************************
 *  Get single review by id
 * *************************************** */
/* ****************************************
 *  Get single review by id (with vehicle info)
 * *************************************** */
async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT 
        r.review_id,
        r.review_text,
        r.review_date,
        r.inv_id,
        r.account_id,
        i.inv_make,
        i.inv_model,
        i.inv_year
      FROM review r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.review_id = $1
    `
    const data = await pool.query(sql, [review_id])
    return data.rows[0]
  } catch (error) {
    console.error("getReviewById error", error)
    throw error
  }
}

/* ****************************************
 *  Update review text (by review_id)
 * *************************************** */
async function updateReview(review_id, review_text) {
  try {
    const sql = `
      UPDATE review
      SET review_text = $1,
          review_date = NOW()
      WHERE review_id = $2
      RETURNING *
    `
    const data = await pool.query(sql, [review_text, review_id])
    return data.rows[0]
  } catch (error) {
    console.error("updateReview error", error)
    throw error
  }
}

/* ****************************************
 *  Delete review (by review_id)
 * *************************************** */
async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM review WHERE review_id = $1`
    const data = await pool.query(sql, [review_id])
    return data.rowCount
  } catch (error) {
    console.error("deleteReview error", error)
    throw error
  }
}

module.exports = {
  getReviewsByInvId,
  getReviewsByAccountId,
  addReview,
  getReviewById,
  updateReview,
  deleteReview,
}
