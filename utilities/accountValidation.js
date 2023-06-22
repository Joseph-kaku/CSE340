const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/accountModel")
const validate = {}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // valid email is required and cannot already exist in the DB
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required."),
    // .custom(async (account_email) => {
    //   const emailExists = await accountModel.checkExistingEmail(account_email)
    //   if (emailExists) {
    //     throw new Error("Email exists. Please log in or use different email")
    //   }
    // })

          // password is required and must be strong password
          body("account_password")
          .trim()
          .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          })
          .withMessage("Password does not meet requirements."),
  ]
}

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/registration", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

    /* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
  validate.checkLogData = async (req, res, next) => {
    const {account_email, account_password} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
        errors,
        title: "Login",
        nav,
        account_email,
        account_password,
      })
      return
    }
    next()
  }

  /* ******************************
 * Update Information Validation Rules
 * ***************************** */
validate.updateInfoRules = () => {
  return [
    body("account_firstname")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Please provide a first name."),

    body("account_lastname")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Please provide a last name."),

    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email)
      if (emailExists) {
        throw new Error("Email exists. Please log in or use different email")
      }
    }),
  ]
}


  /* ******************************
 * Update Information Validation Rules for password
 * ***************************** */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
.trim()
.isStrongPassword({
  minLength: 12,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
})
.withMessage("Password does not meet requirements."),
  ]
}


  /* ******************************
 * Check update information and return errors or continue to registration
 * ***************************** */
validate.checkUpdateInfo = async (req, res, next) => {
  const {account_firstname, account_lastname, account_email, account_password} = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/updateView", {
      errors,
      title: "Edit Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    })
    return
  }
  next()
}

  /* ******************************
 * Check update information(password) and return errors or continue to registration
 * ***************************** */
  validate.checkUpdatePassword = async (req, res, next) => {
    const {account_password} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render("account/updateView", {
        account_password,
      })
      return
    }
    next()
  }

  module.exports = validate