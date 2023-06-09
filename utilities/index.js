const invModel = require("../models/inventoryModel")
const accModel = require("../models/accountModel")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = '<ul id = "navi">'

  // hamburger menu build
  list += '<input type="checkbox" id="nav-toggle" hidden>'
  list += '<label for="nav-toggle" class="nav-toggle">'
  list += '<span></span>'
  list += '</label>'
  list += '<ul class="nav-menu">'


  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the single car view HTML
* ************************************ */
Util.buildInvView = async function(data){
  let div
  if(data.length > 0){ 
    div = '<h1 id="invName">' + data[0].inv_year + ' ' + data[0].inv_make + ' ' + data[0].inv_model  + '</h1>'
    div += '<div class="car-image">'+ '<img src="' + data[0].inv_image + '"' + '" alt="Image of '+ data[0].inv_make + ' ' + data[0].inv_model 
    +' on CSE Motors" />'
    div += '<div class="describe"><h2>' + data[0].inv_make + ' ' + data[0].inv_model + '</h2><h3>Price: $' + new Intl.NumberFormat('en-US').format(data[0].inv_price) + '</h3>'
    div += '<h3 id="description">Description:</h3> <p>' + data[0].inv_description + '</p>'
    div += '<h3 id="color">Color:</h3> <p>' + data[0].inv_color + '</p>'
    div += '<h3 id="miles">Miles:</h3> <p>' + new Intl.NumberFormat('en-US').format(data[0].inv_miles) + '</p></div></div>'
  }
  else{
    div += "Sorry, no inventory details could be found."
  }
  return div
}

/* ************************
 * Constructs the drop down menu
 ************************** */
Util.getClass = async function(optionSelected){
  let data = await invModel.getClassifications()
  let select = "<select name='classification_id' id='classificationList'>"
  let options = "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    options += `
    <option
      value = "${row.classification_id}"
      ${row.classification_id === Number(optionSelected)? 'selected':''} > ${row.classification_name} </option>`
  })
  select += options
  select += "</select>"
  return select
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
 *  Check Account Type for logged in users
 * ************************************ */
 Util.checkAccount = (req, res, next) => {
  // this redirects you to the login page if you try to access the inventory management without loggin in
  if (res.locals.loggedin != 1){
    req.flash("error", "You do not have permission to access this page. :O")
    res.status(403).redirect("/account/login")
  }
  // receive the account type from the payload
  const account_type = res.locals.accountData.account_type
  // verify if the account is an employee or an admin
  if (account_type === 'Employee' || account_type === 'Admin') {
    next() // move to the next thing
  } else {
    req.flash("error", "You do not have permission to access this page. :O")
    res.status(403).redirect("/account/login")
  }
 }

/* ******************************************************************************************************************************************************************************
*                                                               THIS NEXT SECTION IS FOR MESSAGES
* ********************************************************************************************************************************************************************************/

/* ********************************************
*  Build the table for messages
* *********************************************/
Util.buildMessageTable = async function (item) {
  let table = '<table><thead>'
  table += '<tr><th>Received</th><th>Subject</th><th>From</th><th>Read</th></tr>'
  table += '</thead>'
  
  table += '<tbody>'
  item.forEach ((item) => {
    table += `<tr><td>${item.message_created.toISOString().slice(0, 10)}</td><td><a href='/account/messages/${item.message_id}'</a>${item.message_subject}</td><td>${item.account_firstname} ${item.account_lastname}</td><td>${item.message_read}</td></tr>`
  })
  table += '</tbody></table>'
  return table
}

/* ********************************************
*  Build the read message
* *********************************************/
// Util.buildMessageToRead = async function (item) {
//   let div = '<div>'
//   div += '<h3 id="subject"> Subject:' + item.rows[0].message_subject + '</h3>'
//   div += '<h3 id="from"> From:' + item.rows[0].account_firstname + " " + item.rows[0].account_lastname + '</h3>'
//   div += '<h3 id="body"> Message:' + item.rows[0].message_body + '</h3>'
//   div += '</div>'
//  return div
// }

/* **********************************************
 * Constructs a drop down menu for selecting Names
 ************************************************/
Util.getName = async function(account_id = null) {
  let data = await accModel.getAccountNames()
  let select = "<select name='message_to' id='accountNames'>"
      select += "<option value=''>Choose an email recipient</option>"
  data.rows.forEach((row) => {
      select += "<option value = " + row.account_id;
      if (account_id == row.account_id) {select += "selected";}
      select += " >" + row.account_firstname + row.account_lastname + "</option>"
    })
  select += "</select>"
  return select
}

module.exports = Util