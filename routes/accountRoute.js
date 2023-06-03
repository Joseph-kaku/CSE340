//Needed Resources
const express = require("express")
const router = new express.Router() 
// const invController = require("../controllers/invController")
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")

// Route to build account login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

//Route to build account registration view
router.get("/registration", utilities.handleErrors(accountController.buildRegistration))

// Post to Database?
router.post('/register', utilities.handleErrors(accountController.registerAccount))

module.exports = router;