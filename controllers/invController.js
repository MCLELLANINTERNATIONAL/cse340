const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Deliver Inventory Management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } catch (err) {
    console.error("buildManagement error", err)
    next(err)
  }
}

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

/* ****************************************
 *  Deliver add Classification view
  * *************************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      classification_name: "",
    })
  } catch (err) {
    console.error("buildAddClassification error", err)
    next(err)
  }
}

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    let nav = await utilities.getNav()

    const result = await invModel.addClassification(classification_name)

    if (result && result.rowCount > 0) {
      // Success: rebuild nav so the new classification shows immediately
      nav = await utilities.getNav()
      req.flash("notice", "Classification added successfully.")
      return res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
      })
    } else {
      // Failure: return to add-classification with sticky data
      req.flash("notice", "Sorry, the classification could not be added.")
      return res.status(501).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        classification_name,
      })
    }
  } catch (err) {
    console.error("addClassification error", err)
    next(err)
  }
}


/* ****************************************
 *  Deliver Add Inventory view
 * *************************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
      // sticky defaults
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      classification_id: "",
    })
  } catch (err) {
    console.error("buildAddInventory error", err)
    next(err)
  }
}

/* ****************************************
 *  Process Add Inventory
 * *************************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()

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

    const safeImage =
    inv_image && inv_image.trim() !== ""
      ? inv_image.trim()
      : "/images/vehicles/no-image.png"

    const safeThumbnail =
      inv_thumbnail && inv_thumbnail.trim() !== ""
        ? inv_thumbnail.trim()
        : "/images/vehicles/no-image-tn.png"

    const result = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      safeImage,
      safeThumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    )

    if (result && result.rowCount > 0) {
      // success – show management with message and updated nav
      nav = await utilities.getNav()
      req.flash(
        "notice",
        `Successfully added vehicle: ${inv_year} ${inv_make} ${inv_model}.`
      )
      return res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
      })
    } else {
      // failure – re-render add-inventory, sticky
      const classificationList = await utilities.buildClassificationList(classification_id)
      req.flash("notice", "Sorry, adding the vehicle failed.")
      return res.status(501).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: null,
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
  } catch (err) {
    console.error("addInventory error", err)
    next(err)
  }
}

module.exports = invCont