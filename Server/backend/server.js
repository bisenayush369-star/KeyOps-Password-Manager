const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

// ✅ IMPORTANT: Render PORT
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== MONGODB =====
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in env");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URI);
let passwordsCollection;

// ===== START SERVER AFTER DB CONNECT =====
async function startServer() {
  try {
    console.log("🔄 Connecting to MongoDB...");
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
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/passwords", async (req, res) => {
  if (!passwordsCollection) {
    return res.status(503).json({ error: "Database not ready" });
  }

  try {
    const data = await passwordsCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch passwords" });
  }
});

app.post("/passwords", async (req, res) => {
  try {
    const { website, username, password } = req.body;

    if (!website || !username || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    await passwordsCollection.insertOne({ website, username, password });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save password" });
  }
});
