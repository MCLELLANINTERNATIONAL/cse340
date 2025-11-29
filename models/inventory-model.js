/*const { deleteClassification } = require("../controllers/invController")*/
const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING *`
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * 
       FROM public.inventory AS i 
       JOIN public.classification AS c 
         ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
    throw error
  }
}

async function getVehicleById(inv_id) {
  try {
    const sql = `
      SELECT 
        inv_id, 
        inv_make, 
        inv_model, 
        inv_year, 
        inv_price, 
        inv_miles,
        inv_color, 
        inv_description, 
        inv_image, 
        inv_thumbnail
      FROM public.inventory
      WHERE inv_id = $1
    `;
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleById error", error);
    throw error;
  }
}

/* *****************************
*   Add new inventory item
* *************************** */
async function addInventory(
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
) {
  try {
    const sql = `
      INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_description, inv_image,
       inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`
    return await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    ])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Delete classification by ID
* *************************** */
async function deleteClassification(classification_id) {
  try {
    const invCheck = await pool.query(
      `SELECT inv_id FROM public.inventory WHERE classification_id = $1`,
      [classification_id]
    )

    if (invCheck.rows.length > 0) {
      return { error: "Cannot delete classification with existing inventory." }
    }

    const sql = `
      DELETE FROM public.classification
      WHERE classification_id = $1
      RETURNING *;
    `
    const data = await pool.query(sql, [classification_id])
    return data.rows[0]
  } catch (error) {
    console.error("deleteClassification error", error)
    throw error
  }
}

async function getClassificationByName(classification_name) {
  try {
    const sql = `
      SELECT classification_id
      FROM public.classification
      WHERE classification_name = $1
    `
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    console.error("getClassificationByName error", error)
    throw error
  }
}

/* *****************************
*   Delete classification by NAME
* *************************** */
async function deleteClassificationByName(classification_name) {
  try {
    const cls = await getClassificationByName(classification_name)
    if (!cls) {
      return { error: "Classification not found." }
    }

    return await deleteClassification(cls.classification_id)
  } catch (error) {
    console.error("deleteClassificationByName error", error)
    throw error
  }
}



/* ============================================================
   NEW FUNCTION ADDED BELOW — EXACTLY AS THE ASSIGNMENT REQUIRES
   Copied from addInventory(), edited for UPDATE
   ============================================================ */


/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"

    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])

    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("Delete Inventory Error:", error)
    return null
  }
}

/* ***************************
 *  Module Exports
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
  deleteClassification,
  deleteClassificationByName,
  updateInventory,
  deleteInventoryItem
}
