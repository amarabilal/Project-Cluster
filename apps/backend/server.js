const express = require("express");
const { Pool } = require("pg");

const app = express();

const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "appdb",
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD,
});

// Probes Kubernetes (liveness/readiness)
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// Routes derrière Ingress (/api -> backend)
app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend (cluster-project)" });
});
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));
app.get("/api/health/db", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", db: "ok" });
  } catch (e) {
    res.status(500).json({ status: "db_error", error: String(e) });
  }
});

app.listen(3000, () => console.log("Backend running on :3000"));