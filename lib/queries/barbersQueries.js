import pool from "../db.js";

// =======================
// BARBERS QUERIES
// =======================

// Get all barbers
export async function getAllBarbers() {
  const result = await pool.query(
    `SELECT * FROM barbers ORDER BY created_at DESC`
  );
  return result.rows;
}

// Get barbers by location
export async function getBarbersByCity(city) {
  const result = await pool.query(
    `SELECT * FROM barbers 
     WHERE city ILIKE $1 
     ORDER BY created_at DESC`,
    [`%${city}%`]
  );
  return result.rows;
}



// Get barber by ID
export async function getBarberById(id) {
  const result = await pool.query(`SELECT * FROM barbers WHERE id = $1`, [id]);
  return result.rows[0];
}

// Create a new barber
export async function createBarber(barber) {
  const {
    full_name,
    city,
    bio,
    phone_number,
    email,
    experience,
    skills,
    specialities,
    images,
    owner_id,
    created_at,
    updated_at,
  } = barber;

  console.log("Creating job with data:", {
    full_name,
    city,
    bio,
    phone_number,
    email,
    experience,
    skills,
    specialities,
    images,
    owner_id,
    created_at,
    updated_at,
  });

  const result = await pool.query(
    `INSERT INTO barbers
      (full_name, city, bio, phone_number, email, experience, skills, specialities, images, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      full_name,
      city,
      bio,
      phone_number,
      email,
      experience,
      JSON.stringify(skills || []),
      JSON.stringify(specialities || []),
      JSON.stringify(images || []),
      owner_id,
    ]
  );

  return result.rows[0];
}

// Update barber (only if owner matches)
export async function updateBarber(id, owner_id, barberData) {
  // Filter out fields that shouldn't be updated
  const allowedFields = [
    "full_name",
    "city",
    "bio",
    "phone_number",
    "email",
    "experience",
    "skills",
    "specialities",
    "images",
  ];

  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(barberData)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);

      // Stringify images if it's the images field
      if (key === "images" || key === "skills" || key === "specialities") {
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
    `UPDATE barbers 
     SET ${fields.join(", ")} 
     WHERE id = $${paramIndex} AND owner_id = $${paramIndex + 1}
     RETURNING *`,
    values
  );

  return result.rows[0];
}

// Delete barber (only if owner matches)
export async function deleteBarber(id, owner_id) {
  const result = await pool.query(
    `DELETE FROM barbers 
     WHERE id = $1 AND owner_id = $2 
     RETURNING *`,
    [id, owner_id]
  );

  return result.rows[0];
}

// Get barbers by owner
export async function getBarbersByOwner(owner_id) {
  const result = await pool.query(
    `SELECT * FROM barbers 
     WHERE owner_id = $1 
     ORDER BY created_at DESC`,
    [owner_id]
  );
  return result.rows;
}
