const reviewModel = require("../models/review-model")
const utilities = require("../utilities/")
const invModel = require("../models/inventory-model")

/* ============================================================================
 * ADD REVIEW (POST) — only logged-in users can post
 * ========================================================================== */
async function addReview(req, res) {
  const { review_text, inv_id } = req.body
  const account_id = res.locals.accountData?.account_id  // secure source only
  const nav = await utilities.getNav()

  if (!account_id) {
    req.flash("notice", "You must be logged in to submit a review.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  if (!review_text || review_text.trim() === "") {
    req.flash("notice", "Review text is required.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  review_date = new Date()

  try {
    await reviewModel.addReview(review_date, review_text.trim(), inv_id, account_id)
    req.flash("notice", "Your review was added successfully.")
    return res.redirect(`/inv/detail/${inv_id}`)
  } catch (err) {
    console.error("addReview error", err)
    req.flash("notice", "Sorry, there was an error adding your review.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }
}

/* ============================================================================
 * BUILD EDIT REVIEW VIEW — only author should access
 * ========================================================================== */
async function buildEditReview(req, res) {
  const review_id = parseInt(req.params.review_id)
  const nav = await utilities.getNav()
  const account_id = res.locals.accountData?.account_id

  const review = await reviewModel.getReviewById(review_id)

  if (!review) {
    req.flash("notice", "Review not found.")
    return res.redirect("/account/")
  }

  if (review.account_id !== account_id) {
    req.flash("notice", "You are not authorized to edit this review.")
    return res.redirect("/account/")
  }

  res.render("review/edit", {
    title: `Edit Review for ${review.inv_year} ${review.inv_make} ${review.inv_model}`,
    nav,
    errors: null,
    review
  })
}

/* ============================================================================
 * BUILD DELETE REVIEW CONFIRMATION VIEW — only author should access
 * ========================================================================== */
async function buildDeleteReview(req, res) {
  const review_id = parseInt(req.params.review_id)
  const nav = await utilities.getNav()
  const account_id = res.locals.accountData?.account_id

  const review = await reviewModel.getReviewById(review_id)

  if (!review) {
    req.flash("notice", "Review not found.")
    return res.redirect("/account/")
  }

  if (review.account_id !== account_id) {
    req.flash("notice", "You are not authorized to delete this review.")
    return res.redirect("/account/")
  }

  const vehicle = await invModel.getVehicleById(review.inv_id)
  const vehicleTitle = vehicle
    ? `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`
    : "Vehicle"

  res.render("review/delete", {
    title: `Delete Review for ${vehicleTitle}`,
    nav,
    errors: null,
    review,
  })
}

/* ============================================================================
 * PROCESS REVIEW UPDATE — ONLY author can update
 * ========================================================================== */
async function updateReview(req, res) {
  const { review_id, review_text } = req.body
  const account_id = res.locals.accountData?.account_id
  const nav = await utilities.getNav()

  if (!review_text || review_text.trim() === "") {
    req.flash("notice", "Review text cannot be empty.")
    const review = await reviewModel.getReviewById(review_id)

    return res.status(400).render("review/edit", {
      title: "Edit Review",
      nav,
      errors: null,
      review: { ...review, review_text }
    })
  }

  try {
    await reviewModel.updateReview(review_id, account_id, review_text.trim())
    req.flash("notice", "Review updated successfully.")
    return res.redirect("/account/")
  } catch (err) {
    console.error("updateReview error", err)
    req.flash("notice", "You are not authorized to update this review.")
    return res.redirect("/account/")
  }
}

/* ============================================================================
 * PROCESS REVIEW DELETE — ONLY author can delete
 * ========================================================================== */
async function deleteReview(req, res) {
  const { review_id } = req.body
  const account_id = res.locals.accountData?.account_id
  const nav = await utilities.getNav()

  try {
    await reviewModel.deleteReview(review_id, account_id)
    req.flash("notice", "Review deleted.")
    return res.redirect("/account/")
  } catch (err) {
    console.error("deleteReview error", err)
    req.flash("notice", "You are not authorized to delete this review.")
    return res.redirect("/account/")
  }
}

module.exports = {
  addReview,
  buildEditReview,
  buildDeleteReview,
  updateReview,
  deleteReview
}
