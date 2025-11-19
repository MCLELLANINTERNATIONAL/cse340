const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (err) {
    console.error("buildByClassificationId error", err)
    next(err)
  }
}
/* ***************************
 *  Build individual vehicle detail view
 * ************************** */

invCont.buildDetailView = async function (req, res, next) {
  try {
    const invId = parseInt(req.params.inv_id)
    if (isNaN(invId)) {
      return next(new Error("Invalid vehicle id"))
    }

    const nav = await utilities.getNav()
    const vehicleData = await invModel.getVehicleById(invId)

    if (!vehicleData) {
      const error = new Error("Vehicle not found")
      error.status = 404
      return next(error)
    }

    const title = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`
    const detailHtml = utilities.buildVehicleDetail(vehicleData)

    res.render("./inventory/detail", {
      title,
      nav,
      detail: detailHtml,
      errors: null,
    })
  } catch (err) {
    console.error("buildDetailView error", err)
    next(err)
  }
}

module.exports = invCont