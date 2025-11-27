const invModel = require("../models/inventory-model")
const jwt =require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build single vehicle detail HTML
 * ************************************ */
/*
 * Build HTML for a single vehicle detail view
 * @param {Object} vehicle
 * @returns {string} HTML string
 */
Util.buildVehicleDetail = function (vehicle) {
  const {
    inv_year,
    inv_make,
    inv_model,
    inv_price,
    inv_miles,
    inv_color,
    inv_description,
    inv_image,
  } = vehicle

  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(inv_price)

  const milesFormatted = Number(inv_miles).toLocaleString("en-US")

  return `
  <section class="vehicle-detail" aria-label="Vehicle Details">
    <figure class="vehicle-detail__image-wrapper">
      <img 
        src="${inv_image}" 
        alt="Image of ${inv_year} ${inv_make} ${inv_model}"
        class="vehicle-detail__image"
        loading="lazy"
      >
    </figure>

    <div class="vehicle-detail__content">
      <h1 class="vehicle-detail__title">
        ${inv_year} ${inv_make} ${inv_model}
      </h1>

      <p class="vehicle-detail__price">
        <span class=label>Price:</span>
        <strong>${priceFormatted}</strong>
      </p>

      <p class="vehicle-detail__miles">
        <span class="label">Mileage:</span>
        <strong>${milesFormatted} miles</strong>
      </p>

      <p class="vehicle-detail__year-make-model">
        <strong>Vehicle:</strong> ${inv_year} ${inv_make} ${inv_model}
      </p>

      <p class="vehicle-detail__color">
        <span class="label">Color:</span>
        <strong>${inv_color}</strong> 
      </p>

      <p class="vehicle-detail__description">
        ${inv_description}
      </p>
    </div>
  </section>
  `
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
 * Build Classification Select List
 ************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    
    // Stickiness → selects previously chosen value
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  
  classificationList += "</select>"
  return classificationList
}


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        } 
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

module.exports = Util
