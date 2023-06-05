//Needed Resources
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/accountValidation')

// Route to build account login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

//Route to build account registration view
router.get("/registration", utilities.handleErrors(accountController.buildRegistration))

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogData,
  (req, res) => {
    res.status(200).send('login process')
  }
)  

module.exports = router;