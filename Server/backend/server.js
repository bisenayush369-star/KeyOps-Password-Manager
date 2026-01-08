const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://key-ops.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* ======================
   ENV
====================== */
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

/* ======================
   DB STATE
====================== */
let passwordsCollection = null;

/* ======================
   HEALTH CHECK (RENDER NEEDS THIS)
====================== */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ======================
   ROUTES (SAFE)
====================== */
app.get("/passwords", async (req, res) => {
  if (!passwordsCollection) {
    return res.status(503).json({ message: "Database not ready" });
  }

  try {
    const passwords = await passwordsCollection.find({}).toArray();
    res.json(passwords);
  } catch (err) {
    console.error("GET /passwords error:", err);
    res.status(500).json({ error: "Failed to fetch passwords" });
  }
});

app.post("/passwords", async (req, res) => {
  if (!passwordsCollection) {
    return res.status(503).json({ message: "Database not ready" });
  }

  try {
    await passwordsCollection.insertOne(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("POST /passwords error:", err);
    res.status(500).json({ error: "Failed to save password" });
  }
});

/* ======================
   START SERVER FIRST
====================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ======================
   CONNECT DB (NON-BLOCKING)
====================== */
async function connectDB() {
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db("keyops");
    passwordsCollection = db.collection("passwords");

    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    // ❌ DO NOT exit — keep server alive on Render
  }
}

connectDB();
