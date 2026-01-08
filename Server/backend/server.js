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
  // If DB not ready yet, return empty list
  if (!passwordsCollection) {
    return res.json([]);
  }

  try {
    const passwords = await passwordsCollection.find({}).toArray();
    res.json(passwords);
  } catch (err) {
    console.error("Fetch failed:", err);
    res.status(500).json({ message: "Failed to fetch passwords" });
  }
});

app.post("/passwords", async (req, res) => {
  if (!passwordsCollection) {
    return res.status(503).json({
      message: "Database not ready, try again"
    });
  }

  try {
    const result = await passwordsCollection.insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Save failed:", err);
    res.status(500).json({ message: "Save failed" });
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
