const { body, validationResult } = require("express-validator")
const utilities = require(".")
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")

const validate = {}

/* ************* RULES ************* */
validate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Review must be at least 3 characters long."),
  ]
}

/* ************* CHECK ADD REVIEW DATA ************* */
validate.checkReviewData = async (req, res, next) => {
  const errors = validationResult(req)
  const { review_text, inv_id } = req.body

  // If NO errors, continue to controller
  if (errors.isEmpty()) {
    return next()
  }

  try {
    let nav = await utilities.getNav()

    // Get vehicle + reviews so the detail page can be rebuilt
    const vehicle = await invModel.getVehicleById(inv_id)
    const detail = utilities.buildVehicleDetail(vehicle)
    const reviews = await reviewModel.getReviewsByInvId(inv_id)

    const title = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`

    // Build screen name if logged in (JSmith)
    let screenName = null
    if (res.locals.accountData) {
      const f = res.locals.accountData.account_firstname
      const l = res.locals.accountData.account_lastname
      screenName = (f.charAt(0) + l).replace(/\s+/g, "")
    }

    return res.status(400).render("inventory/detail", {
      title,
      nav,
      detail,
      vehicle,
      reviews,
      screenName,
      accountData: res.locals.accountData || null,
      errors: errors.array(),
      review_text, // makes textarea sticky
    })
  } catch (err) {
    console.error("checkReviewData error", err)
    next(err)
  }
}

/* ************* CHECK EDIT REVIEW DATA ************* */
validate.checkEditReviewData = async (req, res, next) => {
  const errors = validationResult(req)
  const { review_id } = req.body

  // If NO errors, continue
  if (errors.isEmpty()) {
    return next()
  }

  try {
    let nav = await utilities.getNav()
    const review = await reviewModel.getReviewById(review_id)

    return res.status(400).render("review/edit", {
      title: "Edit Review",
      nav,
      errors: errors.array(),
      review,
    })
  } catch (err) {
    console.error("checkEditReviewData error", err)
    next(err)
  }
}

module.exports = validate

