const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please login or use different email")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors: errors.array(),
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
}

/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide a password."),
  ]
}

/* ******************************
 * Check login data and return errors or continue
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
    })
  }
  next()
}

/* ****************************************
 *  UPDATE ACCOUNT RULES
 * *************************************** */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters long."),
    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long."),
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email address is required.")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const existing = await accountModel.checkExistingEmail(account_email)

        // If email exists and belongs to a *different* account, block it
        if (existing && existing.account_id != account_id) {
          throw new Error(
            "That email already exists. Please use a different email."
          )
        }
        return true
      }),
  ]
}

/* ****************************************
 *  CHECK UPDATE ACCOUNT DATA
 * *************************************** */
validate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    const accountData = {
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    }

    return res.status(400).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      accountData,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
  next()
}

/* ****************************************
 *  PASSWORD UPDATE RULES
 * *************************************** */
validate.passwordUpdateRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      ),
  ]
}

/* ****************************************
 *  CHECK PASSWORD UPDATE DATA
 * *************************************** */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const account_id = req.body.account_id
    const accountData = await accountModel.getAccountById(account_id)

    return res.status(400).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      accountData,
    })
  }
  next()
}

module.exports = validate