// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Management view
router.get(
    "/",
    utilities.handleErrors(invController.buildManagement)
)

// Route to build inventory by classification view
router.get("/type/:classificationId",
utilities.handleErrors(invController.buildByClassificationId)
)

// Route to build individual vehicle detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView)
)

// Route to build Add Classification view
router.get(
    "/add-classification",
    utilities.handleErrors(invController.buildAddClassification)
)

// Process Add Classification
router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassData,
    utilities.handleErrors(invController.addClassification)
)

router.get(
    "/delete-classification/:classificationId",
    utilities.handleErrors(invController.deleteClassification)
)  

router.post(
    "/delete-classification/:classificationId",
    utilities.handleErrors(invController.deleteClassification)
)

// Delete classification by NAME (POST)
router.post(
    "/delete-classification-by-name",
    utilities.handleErrors(invController.deleteClassificationByName)
  )
  
  
// Route to build Add Inventory view
router.get(
    "/add-inventory",
    utilities.handleErrors(invController.buildAddInventory)
)

// Process Add Inventory
router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInvData,
    utilities.handleErrors(invController.addInventory)
)

module.exports = router