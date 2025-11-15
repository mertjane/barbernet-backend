import express from "express";
import {
  getAllJobs,
  getJobsByLocation,
  getJobsByType,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from "../lib/queries/jobsQueries.js";

const router = express.Router();

// =============================================
// GET /api/jobs - List all jobs
// =============================================
router.get("/", async (req, res) => {
  try {
    const jobs = await getAllJobs();
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// =============================================
// GET /api/jobs/list?location=&type= - Filter jobs by location or type
// =============================================
router.get("/list", async (req, res) => {
  try {
    const { location, type } = req.query;

    if (location) {
      const jobs = await getJobsByLocation(location);
      return res.json(jobs);
    }

    if (type) {
      const jobs = await getJobsByType(type);
      return res.json(jobs);
    }

    // If no filters, return all jobs
    const jobs = await getAllJobs();
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// =============================================
// GET /api/jobs/:id - Get single job by ID
// =============================================
router.get("/:id", async (req, res) => {
  try {
    const job = await getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// =============================================
// POST /api/jobs/new-job - Create a new job
// =============================================
router.post("/new-job", async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    // Validate required fields
    const requiredFields = [
      "shop_name",
      "phone_number",
      "location",
      "job_type",
      "salary_text",
      "description",
      "owner_id",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ 
          error: `Missing required field: ${field}` 
        });
      }
    }

    // Map job type to proper format
    const typeMap = {
      "full time": "Full-time",
      "part time": "Part-time",
      "rent a chair": "Rent a Chair",
      "temporary": "Temporary",
      "contract": "Contract",
    };

    const jobData = {
      shop_name: req.body.shop_name,
      phone_number: req.body.phone_number,
      location: req.body.location,
      job_type: typeMap[req.body.job_type?.toLowerCase()] || req.body.job_type,
      salary_text: req.body.salary_text,
      description: req.body.description,
      images: req.body.images || [],
      owner_id: req.body.owner_id,
    };

    console.log("Mapped job data:", jobData);

    const newJob = await createJob(jobData);
    res.status(201).json(newJob);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// PUT /api/jobs/update/:id - Update existing job (owner only)
// =============================================
router.put("/update/:id", async (req, res) => {
  try {
    const { owner_id } = req.body;

    if (!owner_id) {
      return res.status(400).json({ error: "owner_id is required" });
    }

    const updatedJob = await updateJob(req.params.id, owner_id, req.body);
    
    if (!updatedJob) {
      return res.status(403).json({ 
        error: "Unauthorized or job not found" 
      });
    }

    res.json(updatedJob);
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ error: "Failed to update job" });
  }
});

// =============================================
// DELETE /api/jobs/delete/:id - Delete job (owner only)
// =============================================
router.delete("/delete/:id", async (req, res) => {
  try {
    const { owner_id } = req.body;

    if (!owner_id) {
      return res.status(400).json({ error: "owner_id is required" });
    }

    const deletedJob = await deleteJob(req.params.id, owner_id);
    
    if (!deletedJob) {
      return res.status(403).json({ 
        error: "Unauthorized or job not found" 
      });
    }

    res.json({ 
      message: "Job deleted successfully", 
      job: deletedJob 
    });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

export default router;