const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(cors({ origin: "*" }));
app.use(express.json());

// ===== MONGODB =====
const client = new MongoClient(process.env.MONGO_URI);
let passwordsCollection;

// ===== START SERVER AFTER DB CONNECT =====
async function startServer() {
  try {
    await client.connect();
    const db = client.db("keyops");
    passwordsCollection = db.collection("passwords");

    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

startServer();

// ===== ROUTES =====

// Health check
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Get all passwords
app.get("/passwords", async (req, res) => {
  if (!passwordsCollection) {
    return res.status(503).json({ error: "Database not ready" });
  }

  try {
    const data = await passwordsCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("❌ GET /passwords failed:", err);
    res.status(500).json({
      error: "Failed to fetch passwords",
      details: err.message,
    });
  }
});

// Add password
app.post("/passwords", async (req, res) => {
  if (!passwordsCollection) {
    return res.status(503).json({ error: "Database not ready" });
  }

  try {
    const { website, username, password } = req.body;

    if (!website || !username || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    await passwordsCollection.insertOne({
      website,
      username,
      password,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ POST /passwords failed:", err);
    res.status(500).json({ error: "Failed to save password" });
  }
});

// Delete password
app.delete("/passwords/:id", async (req, res) => {
  if (!passwordsCollection) {
    return res.status(503).json({ error: "Database not ready" });
  }

  try {
    await passwordsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /passwords failed:", err);
    res.status(500).json({ error: "Failed to delete password" });
  }
});
