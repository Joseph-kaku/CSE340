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
 *  Deliver account update information view
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
  let nav = await utilities.getNav()
  const {account_firstname, account_lastname, account_email, account_id} = req.body

  const result = await accountModel.updateInfo(account_firstname, account_lastname, account_email, account_id)
  const data = await accountModel.getAccountByAccountId(account_id)

  if (result) {
    try {
      const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      req.flash("success", "Account was succesfully updated")
      return res.redirect("/account/")
    } catch(error) {
      throw new Error("don't be dumb")
    }
  } else {
    req.flash("error", `Sorry the update for ${account_firstname} failed`)
    res.status(501).render("account/updateView", {
      title: "Edit " + account_firstname,
      nav,
      errors: null,
      account_firstname,
      account_lastname, 
      account_email,
      account_id
    })
  }
}

async function updateInfoPassword (req, res) {
  let nav = await utilities.getNav()
  const {account_id, account_password, account_firstname, account_lastname, account_email} =req.body
  
  let hashedPassword
  try{
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("error", 'Sorry, there was an error processing the password change.')
    res.status(500).render("account/updateView", {
      title: "Edit Account",
      nav,
      errors: null,
    })
  }
  const accountId = parseInt(req.body.account_id);
  const accountData = await accountModel.getAccountByAccountId(accountId)
  const result = await accountModel.updateInfoPassword(hashedPassword, account_id)
 if (result) {
  req.flash ("success", "You have successfully updated your password")
  res.status(201).render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
 } else {
  req.flash("error", "Sorry the password update failed")
  res.status(501).render("account/updateView", {
    title: "Edit Account",
    nav,
    errors:null,
    account_id: accountData.accountId,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
 }
}

/* ******************************************************************************************************************************************************************************
*                                                               THIS NEXT SECTION IS FOR MESSAGES
* ********************************************************************************************************************************************************************************/

/* ****************************************
*  Deliver message inbox view
* *****************************************/
async function buildInbox(req, res) {
  let nav = await utilities.getNav()
  const accountId = req.params.account_id
  const accountData = await accountModel.getAccountByAccountId(accountId)
  const messageDataTable = await accountModel.getMessagesById(accountId)
  const table = await utilities.buildMessageTable(messageDataTable.rows)
  res.render("account/inbox", {
    title: accountData.account_firstname + " " + accountData.account_lastname + " " + "inbox",
    nav,
    errors: null,
    table,
  })
}

/* ****************************************
*  Deliver message view
* *****************************************/
async function buildMessage(req, res) {
  let nav = await utilities.getNav()

  const accountId = res.locals.accountData.account_id
  const messageData = await accountModel.getMessagesById(accountId)

  const messageId = req.params.message_id
  const message = await accountModel.getMessageViewByID(messageId)
  // console.log(messageId)
  // console.log(messageData)
  // console.log(messageData.rows[0].message_subject)
  
  res.render("account/messages", {
    title: message[0].message_subject,
    nav,
    from: messageData.rows[0].account_firstname + " " + messageData.rows[0].account_lastname,
    message: message[0].message_body,
    created: message[0].message_created,
    errors:null,
    message_id: messageId,
  })
}

/* ****************************************
*  Deliver create message view
* *****************************************/
async function newMessageView(req, res) {
let nav = await utilities.getNav()
const names = await accountModel.getAccountNames()
let select = await utilities.getName(names)
res.render("./account/createMessage", {
  title: "New Message",
  nav,
  select,
  errors:null,
})
}

/* ****************************************
*  Process message send
* *****************************************/
async function sendNewMessage (req, res) {
  const {message_to, message_from, message_subject, message_body} = req.body

  const result = await accountModel.newMessageSent(message_to, message_from, message_subject, message_body)
  console.log(result)
  if (result) {
    let nav = await utilities.getNav()
    let select = await utilities.getName()
    const accountId = req.params.account_id
    // const accountData = await accountModel.getAccountByAccountId(accountId)
    const messageDataTable = await accountModel.getMessagesById(accountId)
    const table = await utilities.buildMessageTable(messageDataTable.rows)
    req.flash("success", "Your message has been sent")
    res.status(201).render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      select,
      table
    }) 
  } else {
    req.flash ("error", "Sorry. Message was not sent. Try again")
    res.status(501).render("account/createMessage", {
      title: "New message",
      nav,
      errors,
      select,
      table
    })
  }

}
  /* ****************************************
*  Deliver reply message view
* *****************************************/
async function replyMessage(req, res) {
  let nav = await utilities.getNav()

  const accountId = res.locals.accountData.account_id
  const messageData = await accountModel.getMessagesById(accountId)

  const messageId = req.params.message_id
  const message = await accountModel.getMessageViewByID(messageId)
  console.log(message)
  console.log(messageData)
  // console.log(messageData.rows[0].message_subject)
  
  res.render("account/reply", {
    title: "Reply Message",
    nav,
    errors:null,
  })
}

  /* ****************************************
*  Process Mark as read
* *****************************************/
async function markAsRead(req, res) {
  let nav = await utilities.getNav()
  const message_id  = req.params.message_id
  console.log(message_id)

  const read = await accountModel.markMessageAsRead(message_id)


  const accountId = res.locals.accountData.account_id
  const messageData = await accountModel.getMessagesById(accountId)


  const message = await accountModel.getMessageViewByID(message_id)

  if (read) {
    req.flash("success", "Your message has been marked read")
    res.render("account/messages", {
      title: message[0].message_subject,
      nav,
      from: messageData.rows[0].account_firstname + " " + messageData.rows[0].account_lastname,
      message: message[0].message_body,
      created: message[0].message_created,
      errors:null,
      message_id
    })
} else {
  req.flash("error", "Try again")
  res.render("account/messages", {
    title: message[0].message_subject,
    nav,
    from: messageData.rows[0].account_firstname + " " + messageData.rows[0].account_lastname,
    message: message[0].message_body,
    created: message[0].message_created,
    errors:null,
    message_id
  })
}
}

/******************************************
*  Deliver archive view
*******************************************/
async function archiveMessageView(req, res) {
  let nav = await utilities.getNav()
  const accountId = req.params.account_id
  const accountData = await accountModel.getAccountByAccountId(accountId)
  const messageDataTable = await accountModel.getArchivedMessages(accountId)
  res.render("account/archive", {
    title: accountData.account_firstname + " " + accountData.account_lastname + " " + "inbox",
    nav,
    
    errors: null
  })
}

  /* ****************************************
*  Process archive message
* *****************************************/
async function archiveMessage(req, res){
  let nav = await utilities.getNav()
  const message_id  = req.params.message_id

  const archive = await accountModel.markMessageAsArchived(message_id)

  const accountId = res.locals.accountData.account_id
  const messageData = await accountModel.getMessagesById(accountId)


  const message = await accountModel.getMessageViewByID(message_id)

  if (archive) {
    req.flash("success", "Your message has been archived")
    res.render("account/messages", {
      title: message[0].message_subject,
      nav,
      from: messageData.rows[0].account_firstname + " " + messageData.rows[0].account_lastname,
      message: message[0].message_body,
      created: message[0].message_created,
      errors:null,
      message_id
    })
} else {
  req.flash("error", "Try again")
  res.render("account/messages", {
    title: message[0].message_subject,
    nav,
    from: messageData.rows[0].account_firstname + " " + messageData.rows[0].account_lastname,
    message: message[0].message_body,
    created: message[0].message_created,
    errors:null,
    message_id
  })
}
}


/******************************************
*  Process delete message
*******************************************/
async function deleteMessage(req, res){
  let nav = await utilities.getNav()
  const message_id  = req.params.message_id
  const dMess = await accountModel.deleteTheMessage(message_id)
  
  const accountId = res.locals.accountData.account_id
  const accountData = await accountModel.getAccountByAccountId(accountId)


  const message = await accountModel.getMessageViewByID(message_id)

  const messageDataTable = await accountModel.getMessagesById(accountId)
  const table = await utilities.buildMessageTable(messageDataTable.rows)
  console.log(message)

  if (dMess) {
    req.flash("success", "Your message has been deleted")
    res.render("account/inbox", {
      title: accountData.account_firstname + " " + accountData.account_lastname + " " + "inbox",
      nav,
      errors: null,
      table,
    })
} else {
  req.flash("error", "Try again")
  res.render("account/inbox", {
    title: accountData.account_firstname + " " + accountData.account_lastname + " " + "inbox",
    nav,
    errors: null,
    table,
  })
}
}

module.exports = { buildLogin, buildRegistration, registerAccount, accountLogin, buildAccountManagement, buildUpdateView, updateInfo, updateInfoPassword, buildInbox, buildMessage, newMessageView, sendNewMessage, replyMessage, markAsRead, archiveMessage, deleteMessage, archiveMessageView}

