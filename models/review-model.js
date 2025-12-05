const pool = require("../database/")

/* ============================================================================
 *  Add New Review
 * ========================================================================== */
async function addReview(review_date, review_text, inv_id, account_id) {
  try {
    if (!review_date || !review_text || !inv_id || !account_id) {
      throw new Error("Invalid review data.")
    }

    const sql = `
      INSERT INTO review (review_date, review_text, inv_id, account_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const data = await pool.query(sql, [review_date, review_text, inv_id, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("addReview error", error)
    throw error
  }
}

/* ============================================================================
 *  Get Reviews for Inventory Item (newest first)
 * ========================================================================== */
async function getReviewsByInvId(inv_id) {
  try {
    const sql = `
      SELECT r.review_id,
             r.review_text,
             r.review_date,
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

/* ============================================================================
 *  Get All Reviews by Account
 * ========================================================================== */
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

/* ============================================================================
 *  Get a Single Review
 * ========================================================================== */
async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT r.review_id,
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
    return data.rows[0] || null
  } catch (error) {
    console.error("getReviewById error", error)
    throw error
  }
}

/* ============================================================================
 *  Update Review (Author Only)
 * ========================================================================== */
async function updateReview(review_id, account_id, review_text) {
  try {
    if (!review_text) throw new Error("Review text cannot be empty.")

    const sql = `
      UPDATE review
         SET review_text = $1,
             review_date = NOW()
       WHERE review_id = $2
         AND account_id = $3
      RETURNING *
    `

    const data = await pool.query(sql, [review_text, review_id, account_id])

    if (data.rowCount === 0) {
      throw new Error("Unauthorized update or review not found.")
    }

    return data.rows[0]
  } catch (error) {
    console.error("updateReview error", error)
    throw error
  }
}

/* ============================================================================
 *  Delete Review (Author Only)
 * ========================================================================== */
async function deleteReview(review_id, account_id) {
  try {
    const sql = `
      DELETE FROM review
      WHERE review_id = $1
        AND account_id = $2
      RETURNING review_id
    `
    const data = await pool.query(sql, [review_id, account_id])

    if (data.rowCount === 0) {
      throw new Error("Unauthorized delete or review not found.")
    }

    return true
  } catch (error) {
    console.error("deleteReview error", error)
    throw error
  }
}

module.exports = {
  addReview,
  getReviewsByInvId,
  getReviewsByAccountId,
  getReviewById,
  updateReview,
  deleteReview,
}
