import express from "express";

import { getAllUsers, upsertUser } from "../lib/queries/userQueries.js";

const router = express.Router();



// =============================================
// POST /api/auth/register
// =============================================
router.post("/register", async (req, res) => {
  const { id, name, email, phone, photo } = req.body;
  console.log("Received user data:", req.body); // <- log incoming request

  if (!id || !email) return res.status(400).json({ error: "id and email are required" });

  try {
    const user = await upsertUser({ id, name, email, phone, photo });
    res.status(200).json(user);
  } catch (err) {
    console.error("Error inserting user:", err); // <- full Postgres error
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// =============================================
// GET /api/auth/users
// =============================================
router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
