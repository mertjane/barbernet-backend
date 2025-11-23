import express from "express";
import {
  getAllShops,
  getShopsByLocation,
  getShopById,
  createShop,
  updateShop,
  deleteShop,
} from "../lib/queries/shopsQueries.js";

const router = express.Router();

// =============================================
// GET /api/shops - List all shops
// =============================================
router.get("/", async (req, res) => {
  try {
    const shops = await getAllShops();
    res.json(shops);
  } catch (err) {
    console.error("Error fetching shops:", err);
    res.status(500).json({ error: "Failed to fetch shops" });
  }
});

// =============================================
// GET /api/shops/list?location= - Filter shops by location
// =============================================
router.get("/list", async (req, res) => {
  try {
    const { location } = req.query;

    if (location) {
      const shops = await getShopsByLocation(location);
      return res.json(shops);
    }

    // If no filters, return all shops
    const shops = await getAllShops();
    res.json(shops);
  } catch (err) {
    console.error("Error fetching shops:", err);
    res.status(500).json({ error: "Failed to fetch shops" });
  }
});

// =============================================
// GET /api/shops/:id - Get single shop by ID
// =============================================
router.get("/:id", async (req, res) => {
  try {
    const shop = await getShopById(req.params.id);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }
    res.json(shop);
  } catch (err) {
    console.error("Error fetching shop:", err);
    res.status(500).json({ error: "Failed to fetch shop" });
  }
});

// =============================================
// POST /api/shops/new-shop - Create a new shop
// =============================================
router.post("/new-shop", async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    // Validate required fields
    const requiredFields = [
      "shop_name",
      "location",
      "info",
      "sale_price",
      "phone_number",
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

    const shopData = {
      shop_name: req.body.shop_name,
      phone_number: req.body.phone_number,
      info: req.body.info,
      location: req.body.location,
      sale_price: req.body.sale_price,
      images: req.body.images || [],
      owner_id: req.body.owner_id,
    };

    console.log("Mapped shop data:", shopData);

    const newShop = await createShop(shopData);
    res.status(201).json(newShop);
  } catch (error) {
    console.error("Error creating shop:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// PUT /api/shops/update/:id - Update existing shop (owner only)
// =============================================
router.put("/update/:id", async (req, res) => {
  try {
    const { owner_id } = req.body;

    if (!owner_id) {
      return res.status(400).json({ error: "owner_id is required" });
    }

    const updatedShop = await updateShop(req.params.id, owner_id, req.body);

    if (!updatedShop) {
      return res.status(403).json({
        error: "Unauthorized or shop not found",
      });
    }

    res.json(updatedShop);
  } catch (err) {
    console.error("Error updating shop:", err);
    res.status(500).json({ error: "Failed to update shop" });
  }
});

// =============================================
// DELETE /api/shops/delete/:id - Delete shop (owner only)
// =============================================
router.delete("/delete/:id", async (req, res) => {
  try {
    const { owner_id } = req.body;

    if (!owner_id) {
      return res.status(400).json({ error: "owner_id is required" });
    }

    const deletedShop = await deleteShop(req.params.id, owner_id);

    if (!deletedShop) {
      return res.status(403).json({
        error: "Unauthorized or shop not found",
      });
    }

    res.json({
      message: "shop deleted successfully",
      job: deletedShop,
    });
  } catch (err) {
    console.error("Error deleting shop:", err);
    res.status(500).json({ error: "Failed to delete shop" });
  }
});

export default router;
