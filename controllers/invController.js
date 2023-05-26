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
    throw new Error("So sorry try again")
  } catch(error){
    next(error)
  }
}

module.exports = invCont