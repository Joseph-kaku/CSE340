const utilities = require(".")
const { body, validationResult } = require("express-validator")
const inventoryModel = require("../models/inventoryModel")
const validate = {}

/*  **********************************
 *  Adding New classification Validation rules
 * ********************************* */
validate.addClassRules = () => {
    return [
        //Classificaiton name is required and must be a string
        body("classification_name")
        .trim()
        .isLength({ min: 3 })
        .isAlpha()
        .withMessage("Please provide a classification name")
        .custom(async (classification_name) => {
           const classNameExists = await inventoryModel.checkExistingClassification(classification_name)
           if (classNameExists) {
            throw new Error("Classification name exists. Add a different one")
           }
        })
    ]
}

    /* ******************************
 * Check data and return errors or continue to management
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const {classification_name} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/addClassification", {
            errors,
            title: "Vehicle Management",
            nav,
            classification_name,
        })
        return
    }
    next()
}

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.checkInventoryInput = () => {
    return [
        // Make is required and must be a string
        body("inv_make")
        .trim()
        .isLength({min: 3})
        .withMessage("Please provide a valid make"),

        // Make is required and must be a string
        body("inv_model")
        .trim()
        .isLength({min: 3})
        .withMessage("Please provide a valid model"),

        // Description is required and must be string
        body("inv_description")
        .trim()
        .isAlpha()
        .withMessage("Please provide a description"),

        // price is required and must be numbers
        body("inv_price")
        .trim()
        .isNumeric()
        .withMessage("Please provide a valid number"),

        // year is required and must be numbers
        body("inv_year")
        .trim()
        .isLength({min: 4, max:4})
        .withMessage("Please use a valid four-digit year"),

        // miles is required and must be numbers
        body("inv_miles")
        .trim()
        .isNumeric()
        .withMessage("Please provide a valid numerical value")

    ]
}

    /* ******************************
 * Check data and return errors or continue to management
 * ***************************** */
    validate.checkInventoryData = async (req, res, next) => {
        const {inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles} = req.body
        let errors = []
        errors = validationResult(req)
        if (!errors.isEmpty()) {
            let nav = await utilities.getNav()
            const table = await inventoryModel.getClassifications()
            let dropmenu = await utilities.getClass(table)
            res.render("inventory/addInventory", {
                errors,
                title: "Add Vehicle",
                dropmenu,
                nav,
                inv_make,
                inv_model,
                inv_description,
                inv_price,
                inv_year,
                inv_miles
            })
            return
        }
        next()
      }

module.exports = validate