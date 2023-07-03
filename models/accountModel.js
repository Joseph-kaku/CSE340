const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
        console.log(account_firstname)
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing first name
 * ********************* */
async function checkExistingFirstName(account_firstname){
  try {
    const sql = "SELECT * FROM account WHERE account_firstname = $1"
    const fname = await pool.query(sql, [account_firstname])
    return fname.rowCount
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing last name
 * ********************* */
async function checkExistingLastName(account_lastname){
  try {
    const sql = "SELECT * FROM account WHERE account_lastname = $1"
    const lname = await pool.query(sql, [account_lastname])
    return lname.rowCount
  } catch (error) {
    return error.message
  }
}


/* ***************************************
* Return account data using email address
* ****************************************/
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account id
* ***************************** */
async function getAccountByAccountId (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname,account_lastname, account_email FROM account WHERE account_id = $1', [account_id])
      return result.rows[0]
  } catch(error) {
    return new Error("No account matches found")
  }
}

// Update account info & password in the DB
async function updateInfo(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = "UPDATE public.account SET account_firstname =$1, account_lastname =$2, account_email =$3 WHERE account_id=$4 RETURNING *"
     return await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
  } catch(error) {
    console.log("model error: " + error )
  }
}

async function updateInfoPassword(account_password, account_id) {
  try {
    const sql = "UPDATE public.account SET account_password =$1 WHERE account_id=$2 RETURNING *"
    return await pool.query(sql, [account_password, account_id])
  } catch(error) {
    console.log("model error: " + error)
  }
}


/* ******************************************************************************************************************************************************************************
*                                                               THIS NEXT SECTION IS FOR MESSAGES
* ********************************************************************************************************************************************************************************/

async function getMessagesById(account_id) {
  try {
    const sql =
      'SELECT message_id, message_subject, message_body, message_created, message_to, message_from, message_read, message_archived, account_firstname, account_lastname FROM message JOIN account ON message_to = account_id WHERE message_to = $1'
    return await pool.query(sql, [account_id])
  } catch(error) {
    return new Error(error)
  }
}



module.exports = {registerAccount, checkExistingEmail, getAccountByEmail, getAccountByAccountId, updateInfo, updateInfoPassword, checkExistingFirstName, checkExistingLastName, getMessagesById}