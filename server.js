// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import jobsRoutes from "./routes/jobs.route.js";
import barbersRoutes from "./routes/barber.route.js";
import shopsRoutes from "./routes/shops.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase from default 100kb
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root route
app.get("/", (req, res) => {
  res.send("BarberNet backend is running 🚀");
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Use the auth routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/barbers", barbersRoutes);
app.use("/api/shops", shopsRoutes);

app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint hit!');
  res.json({ message: 'Backend is reachable' });
});



app.listen(port, () =>
  console.log(`✅ Server running on http://localhost:${port}`)
);
