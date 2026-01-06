const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = 3000;

// ===== MIDDLEWARE =====
app.use(cors({ origin: "*" }));
app.use(express.json());

// ===== MONGODB =====
const client = new MongoClient(process.env.MONGO_URI);
let passwordsCollection;

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
    res.status(500).json({ error: "Failed to save password" });
  }
});

// Delete password
app.delete("/passwords/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await passwordsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
