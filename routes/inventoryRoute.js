// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/");
const regValidate = require("../utilities/inventoryValidation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build view for one car
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));
// router.ger("/detail/:invId", invController.buildByInvId)

// Error link
router.get("/throwError", utilities.handleErrors(invController.throwError)); 

//management link
router.get("/", utilities.handleErrors(invController.buildManager))

//Classification link
router.get("/addClassification", utilities.handleErrors(invController.buildNewClassification))

//Add new classification
router.post("/addClassification", 
regValidate.addClassRules(),
regValidate.checkClassificationData,
utilities.handleErrors(invController.newClassification))

// inventory link
router.get("/addInventory", utilities.handleErrors(invController.buildnewVehicle)) 

// add new inventory item link
router.post("/addInventory", 
regValidate.checkInventoryInput(),
regValidate.checkInventoryData,
utilities.handleErrors(invController.newInventoryItem))

module.exports = router;
