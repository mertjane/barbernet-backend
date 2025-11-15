import pool  from "../db.js"; 


async function upsertUser({ id, name, email, phone, photo }) {
  const { rows } = await pool.query(
    `INSERT INTO users (id, name, email, phone, photo)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id)
     DO UPDATE SET
       name = EXCLUDED.name,
       email = EXCLUDED.email,
       phone = EXCLUDED.phone,
       photo = EXCLUDED.photo,
       updated_at = NOW()
     RETURNING *;`,
    [id || null, name || null, email || null, phone || null, photo || null]
  );
  return rows[0];
}

// Get user by ID
async function getUserById(id) {
  return await pool.query(
    "SELECT * FROM users WHERE id = $1", [id]
  );
}

// Get all users
async function getAllUsers() {
  const { rows } = await pool.query(
    "SELECT * FROM users ORDER BY created_at DESC;"
  );
  return rows;
}

// Update User details
async function updateUser({ id, name, email, phone, photo }) {
  if (!id) throw new Error("User ID is required!");

  const { rows } = await pool.query(
    `UPDATE users
     SET
       name = COALESCE($2, name),
       email = COALESCE($3, email),
       phone = COALESCE($4, phone),
       photo = COALESCE($5, photo),
       updated_at = NOW()
     WHERE id = $1 
     RETURNING *;`,
    [id, name || null, email || null, phone || null, photo || null]
  );

  return rows[0];
}

export { upsertUser, getAllUsers, updateUser, getUserById};
