import express from "express";
import {
  getAllBarbers,
  getBarbersByCity,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber,
} from "../lib/queries/barbersQueries.js";

const router = express.Router();

// =============================================
// GET /api/barbers - List all barbers
// =============================================
router.get("/", async (req, res) => {
  try {
    const barbers = await getAllBarbers();
    res.json(barbers);
  } catch (err) {
    console.error("Error fetching barbers:", err);
    res.status(500).json({ error: "Failed to fetch barbers" });
  }
});

// =============================================
// GET /api/barbers/list?city= - Filter barbers by city
// =============================================
router.get("/list", async (req, res) => {
  try {
    const { city } = req.query;

    if (city) {
      const barbers = await getBarbersByCity(city);
      return res.json(barbers);
    }

    // If no filters, return all barbers
    const barbers = await getAllBarbers();
    res.json(barbers);
  } catch (err) {
    console.error("Error fetching barbers:", err);
    res.status(500).json({ error: "Failed to fetch barbers" });
  }
});

// =============================================
// GET /api/barbers/:id - Get single barber by ID
// =============================================
router.get("/:id", async (req, res) => {
  try {
    const barber = await getBarberById(req.params.id);
    if (!barber) {
      return res.status(404).json({ error: "Barber not found" });
    }
    res.json(barber);
  } catch (err) {
    console.error("Error fetching barber:", err);
    res.status(500).json({ error: "Failed to fetch barber" });
  }
});

// =============================================
// POST /api/barbers/new-barber - Create a new barber
// =============================================
router.post("/new-barber", async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    // Validate required fields
    const requiredFields = [
      "full_name",
      "city",
      "phone_number",
      "skills",
      "specialities",
      "images",
      "owner_id",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          error: `Missing required field: ${field}`,
        });
      }
    }

    // Map barber experience to proper format
    const experienceMap = {
      "0-1 years": "0-1 Years",
      "2-3 years": "2-3 Years",
      "4-6 years": "4-6 years",
      "7-10 years": "7-10 Years",
      "10+": "10+",
    };

    const barberData = {
      full_name: req.body.full_name,
      phone_number: req.body.phone_number,
      bio: req.body.bio || null,
      city: req.body.city,
      email: req.body.email || null,
      experience: experienceMap[req.body.experience?.toLowerCase()] || req.body.experience || null,
      skills: req.body.skills || [],
      specialities: req.body.specialities || [],
      images: req.body.images || [],
      owner_id: req.body.owner_id,
    };

    console.log("Mapped barber data:", barberData);

    const newBarber = await createBarber(barberData);
    res.status(201).json(newBarber);
  } catch (error) {
    console.error("Error creating barber:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// PUT /api/barbers/update/:id - Update existing barber (owner only)
// =============================================
router.put("/update/:id", async (req, res) => {
  try {
    const { owner_id } = req.body;

    if (!owner_id) { 
      return res.status(400).json({ error: "owner_id is required" });
    }

    const updatedBarber = await updateBarber(req.params.id, owner_id, req.body);

    if (!updatedBarber) {
      return res.status(403).json({
        error: "Unauthorized or barber not found",
      });
    }

    res.json(updatedBarber);
  } catch (err) {
    console.error("Error updating barber:", err);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// =============================================
// DELETE /api/barbers/delete/:id - Delete barber (owner only)
// =============================================
router.delete("/delete/:id", async (req, res) => {
  try {
    const { owner_id } = req.body;

    if (!owner_id) {
      return res.status(400).json({ error: "owner_id is required" });
    }

    const deletedBarber = await deleteBarber(req.params.id, owner_id);

    if (!deletedBarber) {
      return res.status(403).json({
        error: "Unauthorized or barber not found",
      });
    }

    res.json({
      message: "Barber deleted successfully",
      job: deletedBarber,
    });
  } catch (err) {
    console.error("Error deleting barber:", err);
    res.status(500).json({ error: "Failed to delete barber" });
  }
});

export default router;
