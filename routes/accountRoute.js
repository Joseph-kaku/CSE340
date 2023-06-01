//Needed Resources
const express = require("express")
const router = new express.Router() 
// const invController = require("../controllers/invController")
const invController = require("../controllers/accController")
const utilities = require("../utilities/")

// Route to build account view
router.get("/account/:login", utilities.handleErrors(accController.buildAccountView))