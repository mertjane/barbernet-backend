import pool from "../db.js";

// =======================
// JOB QUERIES
// =======================

// Get all jobs
export async function getAllJobs() {
  const result = await pool.query(
    `SELECT * FROM jobs ORDER BY created_at DESC`
  );
  return result.rows;
}

// Get jobs by location
export async function getJobsByLocation(location) {
  const result = await pool.query(
    `SELECT * FROM jobs 
     WHERE location ILIKE $1 
     ORDER BY created_at DESC`,
    [`%${location}%`]
  );
  return result.rows;
}

// Get jobs by type
export async function getJobsByType(type) {
  const result = await pool.query(
    `SELECT * FROM jobs 
     WHERE job_type = $1 
     ORDER BY created_at DESC`,
    [type]
  );
  return result.rows;
}

// Get job by ID
export async function getJobById(id) {
  const result = await pool.query(
    `SELECT * FROM jobs WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

// Create a new job
export async function createJob(job) {
  const {
    shop_name,
    phone_number,
    location,
    job_type,
    salary_text,
    description,
    images,
    owner_id,
  } = job;

  console.log("Creating job with data:", {
    shop_name,
    phone_number,
    location,
    job_type,
    salary_text,
    owner_id,
  });

  const result = await pool.query(
    `INSERT INTO jobs
      (shop_name, phone_number, location, job_type, salary_text, description, images, owner_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      shop_name,
      phone_number,
      location,
      job_type,
      salary_text,
      description,
      JSON.stringify(images || []),
      owner_id,
    ]
  );

  return result.rows[0];
}

// Update job (only if owner matches)
export async function updateJob(id, owner_id, jobData) {
  // Filter out fields that shouldn't be updated
  const allowedFields = [
    "shop_name",
    "phone_number",
    "location",
    "job_type",
    "salary_text",
    "description",
    "images",
  ];

  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(jobData)) {
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
    `UPDATE jobs 
     SET ${fields.join(", ")} 
     WHERE id = $${paramIndex} AND owner_id = $${paramIndex + 1}
     RETURNING *`,
    values
  );

  return result.rows[0];
}

// Delete job (only if owner matches)
export async function deleteJob(id, owner_id) {
  const result = await pool.query(
    `DELETE FROM jobs 
     WHERE id = $1 AND owner_id = $2 
     RETURNING *`,
    [id, owner_id]
  );

  return result.rows[0];
}

// Get jobs by owner
export async function getJobsByOwner(owner_id) {
  const result = await pool.query(
    `SELECT * FROM jobs 
     WHERE owner_id = $1 
     ORDER BY created_at DESC`,
    [owner_id]
  );
  return result.rows;
}