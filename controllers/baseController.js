const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  req.flash("notice", "This is a flash message.")
  res.render("index", {title: "Home", nav})
}

// Task 3: intentional error
baseController.triggerError = async function (req, res, next) {
  throw new Error("Intentional test error for Task 3")
}

module.exports = baseController