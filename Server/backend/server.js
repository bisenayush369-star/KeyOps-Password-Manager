const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

/* ================== CONFIG ================== */
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

/* ================== MIDDLEWARE ================== */
app.use(cors());
app.use(express.json());

/* ================== MONGODB ================== */
const client = new MongoClient(MONGO_URI);
let passwordsCollection;

/* ================== ROUTES ================== */

// Health check
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Get all passwords
app.get("/passwords", async (req, res) => {
  try {
    if (!passwordsCollection) {
      return res.status(503).json({ error: "Database not ready" });
    }

    const data = await passwordsCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch passwords" });
  }
});

// Add password
app.post("/passwords", async (req, res) => {
  try {
    const { website, username, password } = req.body;

    if (!website || !username || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    await passwordsCollection.insertOne({ website, username, password });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Insert error:", err);
    res.status(500).json({ error: "Failed to save password" });
  }
});

// Delete password
app.delete("/passwords/:id", async (req, res) => {
  try {
    await passwordsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Failed to delete password" });
  }
});

/* ================== START SERVER AFTER DB ================== */
async function startServer() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();

    const db = client.db("keyops");
    passwordsCollection = db.collection("passwords");

    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

startServer();
