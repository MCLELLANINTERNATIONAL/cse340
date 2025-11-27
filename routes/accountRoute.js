const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

/* ****************************************
 *  Deliver Login View
 * *************************************** */
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

/* ****************************************
 *  Deliver Registration View
 * *************************************** */
router.get(
    "/register",
    utilities.handleErrors(accountController.buildRegister)
)

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default Account Management View (after successful login)
router.get(
  "/",
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountManagement)
)

module.exports = router