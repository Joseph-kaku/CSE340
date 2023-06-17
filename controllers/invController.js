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
  const table = await invModel.getClassifications()
  let dropmenu = await utilities.getClass(table)
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    dropmenu,
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
      "success",
      `Congratulations, you\'ve added ${classification_name} as a new Classification`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors:null,
    })
  } else {
    req.flash("error", 
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
    res.status(201).render("inventory/management", {
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getBuildByCarView(inv_id)
  const table = await invModel.getClassifications()
  console.log(itemData)
  let classificationSelect = await utilities.getClass(table)
  // const classificationSelect = await utilities.getClass(itemData.classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/editInventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id
  })
}

/* ****************************************
*  Process Inventory Item (Vehicle) Update
* *************************************** */
invCont.updateInventory = async function(req, res) {
  const {
     inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id} = req.body
    
    
    const regResult = await invModel.updateInventory(
      inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id)
    if (regResult) {
      const itemName = regResult.inv_make + " " + regResult.inv_model
      req.flash("notice", `The ${itemName} was successfully updated.`)
      res.redirect("/inv/")
    } else {
      let nav = await utilities.getNav()
      let data = await invModel.getClassifications()
      const classificationSelect = await utilities.getClass(data)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the insert failed.")
      res.status(501).render("inventory/editInventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
      })
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.buildDeleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getBuildByCarView(inv_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/deleteConfirm", {
    title: "Delete " + itemName,
    nav,
    inv_id: itemData[0].inv_id,
    errors: null,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_price: itemData[0].inv_price
  })
}

/* ****************************************
*  Process Inventory Item (Vehicle) Delete
* *************************************** */
invCont.deleteInventory = async function(req, res) {
  const {
     inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id} = req.body
    
     const regResult = await invModel.deleteInventory(
       inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id)
       if (regResult) {
         const itemName = regResult.inv_make + " " + regResult.inv_model
      req.flash("success", `The ${itemName} was successfully deleted.`)
      res.redirect("/inv/")
    } else {
      let nav = await utilities.getNav()
      const itemName = `${inv_make} ${inv_model}`
      req.flash("error", "Sorry, the delete failed.")
      res.status(501).render("inventory/deleteConfirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      })
  }
}

module.exports = invCont