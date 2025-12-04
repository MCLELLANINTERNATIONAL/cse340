const reviewModel = require("../models/review-model")
const utilities = require("../utilities/")
const invModel = require("../models/inventory-model")

/* Build add-review process (POST from detail page) */
async function addReview(req, res) {
  const { review_text, inv_id, account_id } = req.body
  let nav = await utilities.getNav()

  // basic server-side guard (you'll add express-validator too)
  if (!review_text || !inv_id || !account_id) {
    req.flash("notice", "Review text is required.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  try {
    await reviewModel.addReview(review_text, inv_id, account_id)
    req.flash("notice", "Your review was added successfully.")
  } catch (err) {
    console.error("addReview error", err)
    req.flash("notice", "Sorry, there was an error adding your review.")
  }

  return res.redirect(`/inv/detail/${inv_id}`)
}

/* Build edit-review view */
async function buildEditReview(req, res) {
  const review_id = parseInt(req.params.review_id)
  const review = await reviewModel.getReviewById(review_id)
  let nav = await utilities.getNav()

  res.render("review/edit", {
    title: `Edit ${review.inv_year} ${review.inv_make} ${review.inv_model} Review`,
    nav,
    errors: null,
    review
  })
}

/* Build delete-review confirmation view */
async function buildDeleteReview(req, res) {
  const review_id = parseInt(req.params.review_id)
  let nav = await utilities.getNav()

  const review = await reviewModel.getReviewById(review_id)

  if (!review) {
    req.flash("notice", "Review not found.")
    return res.redirect("/account/")
  }

  // Get vehicle to show year/make/model in the title
  let vehicle = null
  try {
    vehicle = await invModel.getVehicleById(review.inv_id)
  } catch (err) {
    // if anything goes wrong, we still show a generic title
  }

  const vehicleTitle = vehicle
    ? `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`
    : "Vehicle"

  res.render("review/delete", {
    title: `Delete ${vehicleTitle} Review`,
    nav,
    errors: null,
    review,
  })
}

/* Process review update */
async function updateReview(req, res) {
  const { review_id, review_text, inv_id } = req.body
  let nav = await utilities.getNav()

  if (!review_text) {
    req.flash("notice", "Review text is required.")
    return res.status(400).render("review/edit", {
      title: "Edit Review",
      nav,
      errors: null,
      review: { review_id, review_text }
    })
  }

  try {
    await reviewModel.updateReview(review_id, review_text)
    req.flash("notice", "Review updated successfully.")
  } catch (err) {
    console.error("updateReview error", err)
    req.flash("notice", "Sorry, there was an error updating the review.")
  }

  return res.redirect("/account/")
}

/* Process review delete */
async function deleteReview(req, res) {
  const { review_id } = req.body
  let nav = await utilities.getNav()

  try {
    await reviewModel.deleteReview(review_id)
    req.flash("notice", "Review deleted.")
  } catch (err) {
    console.error("deleteReview error", err)
    req.flash("notice", "Sorry, there was an error deleting the review.")
  }

  return res.redirect("/account/")
}

module.exports = {
  addReview,
  buildEditReview,
  buildDeleteReview,
  updateReview,
  deleteReview
}