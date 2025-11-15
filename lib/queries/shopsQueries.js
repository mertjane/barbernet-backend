import pool from "../db.js";

// =======================
// SHOPS QUERIES
// =======================

// Get all shops
export async function getAllShops() {
  const result = await pool.query(
    `SELECT * FROM shops ORDER BY created_at DESC`
  );
  return result.rows;
}

// Get shops by location
export async function getShopsByLocation(location) {
  const result = await pool.query(
    `SELECT * FROM shops 
     WHERE city ILIKE $1 
     ORDER BY created_at DESC`,
    [`%${location}%`]
  );
  return result.rows;
}



// Get shop by ID
export async function getShopById(id) {
  const result = await pool.query(`SELECT * FROM shops WHERE id = $1`, [id]);
  return result.rows[0];
}

// Create a new shop
export async function createShop(shop) {
  const {
    shop_name,
    location,
    info,
    sale_price,
    phone_number,
    images,
    owner_id,
    created_at,
    updated_at,
  } = shop;

  console.log("Creating shop with data:", {
    shop_name,
    location,
    info,
    phone_number,
    images,
    sale_price,
    owner_id,
    created_at,
    updated_at,
  });

  const result = await pool.query(
    `INSERT INTO shops
      (shop_name, location, info, phone_number, sale_price, images, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      shop_name,
      location,
      info,
      phone_number,
      sale_price,
      JSON.stringify(images || []),
      owner_id,
    ]
  );

  return result.rows[0];
}

// Update shop (only if owner matches)
export async function updateShop(id, owner_id, shopData) {
  // Filter out fields that shouldn't be updated
  const allowedFields = [
    "shop_name",
    "location",
    "info",
    "phone_number",
    "sale_price",
    "images",
  ];

  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(shopData)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);

      // Stringify images if it's the images field
      if (key === "images") {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }

      paramIndex++;
    }
  }

  // If no fields to update, return null
  if (fields.length === 0) {
    return null;
  }

  // Add updated_at
  fields.push(`updated_at = now()`);

  // Add id and owner_id as last parameters
  values.push(id, owner_id);

  const result = await pool.query(
    `UPDATE shops 
     SET ${fields.join(", ")} 
     WHERE id = $${paramIndex} AND owner_id = $${paramIndex + 1}
     RETURNING *`,
    values
  );

  return result.rows[0];
}

// Delete shop (only if owner matches)
export async function deleteShop(id, owner_id) {
  const result = await pool.query(
    `DELETE FROM shops 
     WHERE id = $1 AND owner_id = $2 
     RETURNING *`,
    [id, owner_id]
  );

  return result.rows[0];
}

// Get shops by owner
export async function getShopsByOwner(owner_id) {
  const result = await pool.query(
    `SELECT * FROM shops 
     WHERE owner_id = $1 
     ORDER BY created_at DESC`,
    [owner_id]
  );
  return result.rows;
}
