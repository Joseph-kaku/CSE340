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
  utilities.handleErrors(accountController.accountLogin)
)  

// Route to build account view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))


// Link for the update information view
router.get("/updateView/:account_id",
utilities.handleErrors(accountController.buildUpdateView))

// Process the update information attempt
router.post("/updateView",
regValidate.updateInfoRules(),
regValidate.checkUpdateInfo,
utilities.handleErrors(accountController.updateInfo))

// Process the update password attempt
router.post("/updateViewPassword", 
regValidate.updatePasswordRules(),
regValidate.checkPassword,
utilities.
handleErrors(accountController.updateInfoPassword))


/* ******************************************************************************************************************************************************************************
*                                                               THIS NEXT SECTION IS FOR MESSAGES
* ********************************************************************************************************************************************************************************/

// route to build the inbox view
router.get("/inbox/:account_id", utilities.handleErrors(accountController.buildInbox))

// route to build the message view
router.get("/messages/:message_id", utilities.handleErrors(accountController.buildMessage))

// Route for create new message view
router.get("/createMessage", utilities.handleErrors(accountController.newMessageView))

// Route to send a new message
router.post("/createMessage", 
utilities.handleErrors(accountController.sendNewMessage))

// Route for reply message view
router.get("/reply/:message_id", utilities.handleErrors(accountController.replyMessage))

// Route for send reply message
router.post("/reply", utilities.handleErrors() )

// Route to mark as read
router.post("/read/:message_id", utilities.handleErrors(accountController.markAsRead))

// Route to archive message
router.post("/archive/:message_id", utilities.handleErrors(accountController.archiveMessage))

// Route to delete message
router.post("/delete/:message_id", utilities.handleErrors(accountController.deleteMessage))

module.exports = router;