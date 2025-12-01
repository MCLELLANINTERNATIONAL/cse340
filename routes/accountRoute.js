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

/* ****************************************
 *  LOGOUT ROUTE
 * *************************************** */
router.get(
  "/logout",
  utilities.handleErrors(accountController.logoutAccount)
)

/* ****************************************
 *  UPDATE ACCOUNT INFO VIEW
 * *************************************** */
router.get(
  "/update/:account_id",
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildUpdateAccount)
)

/* ****************************************
 *  PROCESS ACCOUNT UPDATE (POST)
 *  /account/update
 * *************************************** */
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
)

/* ****************************************
 *  PROCESS PASSWORD CHANGE (POST)
 *  /account/update-password
 * *************************************** */
router.post(
  "/update-password",
  regValidate.passwordUpdateRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

/* ****************************************
 *  Default Account Management View (after successful login)
 * *************************************** */
router.get(
  "/",
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountManagement)
)

module.exports = router