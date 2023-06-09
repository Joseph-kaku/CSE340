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

module.exports = validate