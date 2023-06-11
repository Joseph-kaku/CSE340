const invModel = require("../models/inventoryModel")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build view for one car
 * ************************** */
invCont.buildByInvId = async function(req, res, next){
  const inv_id = req.params.invId;
  const data = await invModel.getBuildByCarView(inv_id);
  const div = await utilities.buildInvView(data);
  let nav = await utilities.getNav()
  res.render("./inventory/inventory",{
    title: "vehicles",
    nav, 
    div,
  })
}

/* ***************************
 * Error function for 500 error
 * ************************** */
invCont.throwError  = function (req, res, next){
  try{
    throw new Error("Try again, you must")
  } catch(error){
    next(error)
  }
}

/* ***************************
 *  Build view for car management
 * ************************** */
invCont.buildManager = async function (req,res,next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Build view for adding classification
 * ************************** */
invCont.buildNewClassification = async function (req,res,next) {
  let nav = await utilities.getNav()
  res.render("./inventory/addClassification", {
    title: "New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Build view for adding new vehicle
 * ************************** */
invCont.buildnewVehicle = async function(req,res,next) {
  let nav = await utilities.getNav()
  const table = await invModel.getClassifications()
  let dropmenu = await utilities.getClass(table)
  res.render("./inventory/addInventory", {
    title: "Add Vehicle",
    nav,
    dropmenu,
    errors: null,
  })
}

/* ****************************************
*  Process New Classification
* *************************************** */
invCont.newClassification = async function(req,res){
  const {classification_name} = req.body

  const regResult = await invModel.newClassification(
    classification_name
  )

  if (regResult) {
    let nav = await utilities.getNav()
    req.flash(
      "notice",
      `Congratulations, you\'ve added ${classification_name} as a new Classification`
    )
    res.status(201).render("inventory/addClassification", {
      title: "Vehicle Management",
      nav,
      errors:null,
    })
  } else {
    req.flash("notice", 
    "Sorry, that did not work."
    )
    res.status(501).render("inventory/addClassification", {
      title: "New Classification",
      nav,
    })
  }
}



/* ****************************************
*  Process New Inventory Item (Vehicle)
* *************************************** */
invCont.newInventoryItem = async function(req, res) {
  const {
     inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id} = req.body
    
    
    const regResult = await invModel.newVehicleAdded(
      inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id)
    if (regResult) {
      let nav = await utilities.getNav()
      let data = await invModel.getClassifications()
      let dropmenu = await utilities.getClass(data)
    req.flash(
      "success",
      `Congratulations, you have added a ${inv_year} ${inv_make} ${inv_model} to the inventory!`
    )
    res.status(201).render("inventory/addInventory", {
      title: "Add Vehicle",
      nav,
      errors: null,
      dropmenu
    })
  } else {
    req.flash (
      "error",
      "Sorry, try again. That didn't work"
    )
    res.status(501).render("inventory/addInventory", {
      title: "Add Vehicle",
      nav,
      errors,
      dropmenu
    })
  }
}

module.exports = invCont