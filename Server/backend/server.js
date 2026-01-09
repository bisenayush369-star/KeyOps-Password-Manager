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

// ===== CREATE PASSWORD =====
app.post("/passwords", async (req, res) => {
  try {
    if (!passwordsCollection) {
      return res.status(503).json({ message: "Database not ready" });
    }

    const { website, username, password } = req.body;

    if (!website || !username || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const result = await passwordsCollection.insertOne({
      website,
      username,
      password,
      createdAt: new Date(),
    });

    res.status(201).json({
      _id: result.insertedId,
      website,
      username,
      password,
    });
  } catch (err) {
    console.error("Save failed:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

/* ======================
   ROUTES (SAFE)
====================== */
app.put("/passwords/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    await passwordsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body }
    );

    res.json({ message: "Updated" });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Update failed" });
  }
});
// ===== GET ALL PASSWORDS =====
app.get("/passwords", async (req, res) => {
  try {
    const passwords = await passwordsCollection.find({}).toArray();
    res.json(passwords);
  } catch (err) {
    console.error("Load failed:", err);
    res.status(500).json({ message: "Load failed" });
  }
});


// ===== DELETE PASSWORD =====
app.delete("/passwords/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const result = await passwordsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Password not found" });
    }

    res.json({ message: "Password deleted successfully" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Delete failed" });
  }
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

    // ✅ START SERVER ONLY AFTER DB IS READY
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // local dev → fail fast
  }
}

connectDB();

