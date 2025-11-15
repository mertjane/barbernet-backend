import express from "express";
import { getUserById, updateUser } from "../lib/queries/userQueries.js";


const router = express.Router();

// =============================================
// GET /api/user/:id
// =============================================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await getUserById(id);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(rows[0])
    return res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Database error", details: err.message });
  }
});


// =============================================
// PUT /api/user/update
// =============================================
router.put("/update", async (req, res) => {
  const { id, name, email, phone, photo } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const updatedUser = await updateUser({ id, name, email, phone, photo });
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});




export default router;