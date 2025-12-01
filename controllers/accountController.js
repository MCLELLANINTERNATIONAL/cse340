const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're successfully registered ${account_firstname}. Please login.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) 
    {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Build account management view
 * ************************************ */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()

  // accountData was set in Util.checkJWTToken
  const accountData = res.locals.accountData

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData,
  })
}

/* ****************************************
 *  Logout
 * ************************************ */
async function logoutAccount(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

/* ****************************************
 *  Deliver UPDATE ACCOUNT view
 *  /account/update/:account_id
 * ************************************ */
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)

  res.render("account/update", {
    title: "Update Account Information",
    nav,
    errors: null,
    accountData,
  })
}

/* ****************************************
 *  PROCESS ACCOUNT UPDATE (Task 5)
 *  /account/update  (POST)
 * ************************************ */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email
  } = req.body

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult) {
    // Get fresh account data & refresh JWT so header + management use new info
    const updatedAccount = await accountModel.getAccountById(account_id)
    delete updatedAccount.account_password

    const accessToken = jwt.sign(
      updatedAccount,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 * 1000 }
    )

    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    req.flash("notice", "Account information updated successfully.")
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    return res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      accountData: {
        account_id,
        account_firstname,
        account_lastname,
        account_email
      }
    })
  }
}

/* ****************************************
 *  PROCESS PASSWORD CHANGE (Task 5)
 *  /account/update-password  (POST)
 * ************************************ */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  // Hash new password
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password change.")
    const accountData = await accountModel.getAccountById(account_id)
    return res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      accountData,
    })
  }

  const pwResult = await accountModel.updatePassword(hashedPassword, account_id)

  if (pwResult) {
    const updatedAccount = await accountModel.getAccountById(account_id)
    delete updatedAccount.account_password

    const accessToken = jwt.sign(
      updatedAccount,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 * 1000 }
    )

    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    const accountData = await accountModel.getAccountById(account_id)
    return res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      accountData,
    })
  }
}

module.exports = { 
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildAccountManagement,
    logoutAccount,
    buildUpdateAccount,
    updateAccount,
    updatePassword
}
