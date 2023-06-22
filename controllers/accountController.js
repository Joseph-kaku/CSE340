const utilities = require("../utilities/")
const accountModel = require("../models/accountModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *****************************************/
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver Regitration view
* *****************************************/
async function buildRegistration(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/registration", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("error", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "sucess",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("error", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
   res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

 /* ****************************************
 *  Deliver management view
 * ************************************ */
 async function buildAccountManagement (req, res, next) {
  let nav = await utilities.getNav()
  req.flash("success", "You're logged in")
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

 /* ****************************************
 *  Deliver update information view
 * ************************************ */
async function buildUpdateView (req, res) {
  let nav = await utilities.getNav()
  const accountId = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountByAccountId(accountId)
  res.render("account/updateView", {
    title: "Edit Account",
    nav,
    errors: null,
    account_id: accountId,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

 /* ****************************************
 *  Process update information & password
 * ************************************ */
async function updateInfo (req, res){
  const {account_firstname, account_lastname, account_email} = req.body

  const result = await accountModel.updateInfo(account_firstname, account_lastname, account_email)
  if (result) {
    const updateItem = result.account_firstname + " " + result.account_lastname
    req.flash("success", `Account ${updateItem} was succesfully updated`)
    res.redirect("/login")
  } else {
    let nav = await utilities.getNav()
    const noUpdate = `${account_firstname} ${account_lastname}`
    req.flash("error", `Sorry the update for ${account_firstname} failed`)
    res.status(501).render("account/updateView", {
      title: "Edit " + noUpdate,
      nav,
      errors: null,
      account_firstname,
      account_lastname, 
      account_email
    })
  }
}

async function updateInfoPassword (req, res) {
  const {account_password} =req.body

  const result = await accountModel.updateInfoPassword( account_password)
  if (result) {
    const passUpdate = result.account_password
    req.flash("success", `The ${passUpdate} was successfully updated, hope you remember what you used`)
    res.redirect("/login")
  } else {
    const noPassUpdate = `${account_password}`
    req.flash("error", "Sorry your password was not updated")
    res.status(501).render("account/updateView",{
      title: "Edit " + noPassUpdate,
      account_password
    })
  }
}

module.exports = { buildLogin, buildRegistration, registerAccount, accountLogin, buildAccountManagement, buildUpdateView, updateInfo, updateInfoPassword}
