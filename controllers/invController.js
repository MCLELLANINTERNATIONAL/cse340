const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const reviewModel = require("../models/review-model")

const invCont = {}

/* ***************************
 *  Deliver Inventory Management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classData = await invModel.getClassifications()
    const classificationSelect = await utilities.buildClassificationList()

    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classifications: classData.rows,
      classificationList: classificationSelect,
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
      const error = new Error("Invalid vehicle id")
      error.status = 400
      throw error
    }

    const nav = await utilities.getNav()
    const vehicleData = await invModel.getVehicleById(invId)

    if (!vehicleData) {
      const error = new Error("Vehicle not found")
      error.status = 404
      throw error
    }

    // Get reviews for this vehicle
    const reviews = await reviewModel.getReviewsByInvId(invId)
    
    const detailHtml = utilities.buildVehicleDetail(vehicleData)

    // Build screen name (JSmith)
    let screenName = null
    if (res.locals.accountData) {
      const f = res.locals.accountData.account_firstname
      const l = res.locals.accountData.account_lastname
      screenName = f.charAt(0) + l
    }

    const title = `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`

    res.render("./inventory/detail", {
      title,
      nav,
      detail: detailHtml,
      vehicle: vehicleData,
      reviews,
      screenName,
      accountData: res.locals.accountData || null,
      errors: null,
    })
  } catch (err) {
    console.error("buildDetailView error", err)
    next(err)
  }
}
/* ****************************************
 *  Deliver Add Classification view
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
      nav = await utilities.getNav()
      const classData = await invModel.getClassifications()

      req.flash("notice", "Classification added successfully.")
      return res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        classifications: classData.rows,
      })
    } else {
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

/* ***************************
 *  Process Add Inventory
 * ************************** */
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

    const safeImage = inv_image?.trim() || "/images/vehicles/no-image.png"
    const safeThumbnail =
      inv_thumbnail?.trim() || "/images/vehicles/no-image-tn.png"

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
      nav = await utilities.getNav()
      const classData = await invModel.getClassifications()

      req.flash(
        "notice",
        `Successfully added vehicle: ${inv_year} ${inv_make} ${inv_model}.`
      )
      return res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        classifications: classData.rows,
      })
    } else {
      const classificationList =
        await utilities.buildClassificationList(classification_id)
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
        inv_image: safeImage,
        inv_thumbnail: safeThumbnail,
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

/* ***************************
 *  Delete Classification by ID
 * ************************** */
invCont.deleteClassification = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classificationId)
    let nav = await utilities.getNav()
    const classData = await invModel.getClassifications()

    const result = await invModel.deleteClassification(classification_id)

    if (result && result.error) {
      req.flash("notice", result.error)
      return res.status(400).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        classifications: classData.rows,
      })
    }

    if (result) {
      req.flash("notice", "Classification deleted successfully.")
    } else {
      req.flash("notice", "Classification delete failed.")
    }

    const updatedClassData = await invModel.getClassifications()
    return res.status(200).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classifications: updatedClassData.rows,
    })
  } catch (err) {
    console.error("deleteClassification error", err)
    next(err)
  }
}

/* ***************************
 *  Delete Classification by Name
 * ************************** */
invCont.deleteClassificationByName = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    let nav = await utilities.getNav()
    const classData = await invModel.getClassifications()

    const result = await invModel.deleteClassificationByName(classification_name)

    if (result && result.error) {
      req.flash("notice", result.error)
      return res.status(400).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        classifications: classData.rows,
      })
    }

    if (result) {
      req.flash(
        "notice",
        `Classification "${classification_name}" deleted successfully.`
      )
    } else {
      req.flash("notice", "Classification delete failed.")
    }

    const updatedClassData = await invModel.getClassifications()
    return res.status(200).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classifications: updatedClassData.rows,
    })
  } catch (err) {
    console.error("deleteClassificationByName error", err)
    next(err)
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    if (isNaN(inv_id)) throw new Error("Invalid inventory id")

    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)

    if (!itemData) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/inv/")
    }

    const classificationSelect = await utilities.buildClassificationList(
      itemData.classification_id
    )

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      ...itemData,
    })
  } catch (err) {
    console.error("editInventoryView error", err)
    next(err)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`

    req.flash("notice", "Sorry, the insert failed.")

    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
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
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(
      classification_id
    )
    if (invData[0] && invData[0].inv_id) {
      return res.json(invData)
    } else {
      throw new Error("No data returned")
    }
  } catch (err) {
    console.error("getInventoryJSON error", err)
    next(err)
  }
}

/* ****************************************
 *  Deliver delete confirmation view
 * **************************************** */
invCont.buildDeleteConfirmation = async function(req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)

  if (!itemData) {
    req.flash("notice", "Vehicle not found.")
    return res.redirect("/inv/")
  }

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    itemName,
    item: itemData,
    errors: null
  })
}

/* ****************************************
 *  Process Inventory Delete
 * **************************************** */
invCont.deleteInventoryItem = async function(req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const result = await invModel.deleteInventoryItem(inv_id)

  if (result && result.rowCount === 1) {
    req.flash("notice", "The inventory item was successfully deleted.")
    return res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    return res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont