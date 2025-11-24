// utilities/inventory-validation.js
const utilities = require(".")
const { body, validationResult } = require("express-validator")

// Create the validator object
const invValidate = {}


/* **********************************
 *  Classification Validation Rules
 *********************************** */
invValidate.classificationRules = () => [
    body("classification_name")
      .trim()
      .notEmpty()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name must be letters and numbers only, no spaces."),
]

/* **********************************
 *  Check classification data
 *********************************** */
invValidate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = validationResult(req)
  
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors,
        classification_name,
      })
    }
    next()
}  

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
invValidate.inventoryRules = () => [
    body("inv_make").trim().escape().notEmpty().withMessage("Please provide the make."),
    body("inv_model").trim().escape().notEmpty().withMessage("Please provide the model."),
    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Please provide the year.")
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Year must be a 4-digit number."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a description."),
    body("inv_image").trim().notEmpty().withMessage("Please provide a main image path."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Please provide a thumbnail."),
    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Please provide a price.")
      .isFloat({ min: 0 })
      .withMessage("Price must be positive."),
    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Please provide the mileage.")
      .isInt({ min: 0 })
      .withMessage("Miles must be an integer."),
    body("inv_color").trim().escape().notEmpty().withMessage("Please provide a color."),
    body("classification_id").notEmpty().withMessage("Please choose a classification."),
  ]
  
  /* ******************************
   * Check inventory data and return errors or continue
   * ***************************** */
  invValidate.checkInvData = async (req, res, next) => {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body
  
    let errors = validationResult(req)
  
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(classification_id)
  
      return res.render("inventory/add-inventory", {
        errors,
        title: "Add New Vehicle",
        nav,
        classificationList,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      })
    }
  
    next()
}

module.exports = invValidate
  