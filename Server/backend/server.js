const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

// 1️⃣ FIRST – body parser
app.use(express.json());

// 2️⃣ SECOND – CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://key-ops.netlify.app",
      "https://keyops-password-manager.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  })
);

// 3️⃣ THEN routes

app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

let passwordsCollection;

async function start() {
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db("keyops");
    passwordsCollection = db.collection("passwords");

    console.log("MongoDB connected ✅");

    // ROUTES
    app.get("/", (req, res) => {
      res.send("Server is running 🚀");
    });

    app.get("/passwords", async (req, res) => {
      try {
        const passwords = await passwordsCollection.find({}).toArray();
        res.json(passwords);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch passwords" });
      }
    });

    app.post("/passwords", async (req, res) => {
      try {
        const { website, username, password } = req.body;
        await passwordsCollection.insertOne({ website, username, password });
        res.json({ success: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save password" });
      }
    });

    app.put("/passwords/:id", async (req, res) => {
  try {
    const { website, username, password } = req.body;

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const result = await passwordsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { website, username, password } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Password not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PUT ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

    app.delete("/passwords/:id", async (req, res) => {
      try {
        await passwordsCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.json({ success: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete password" });
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB failed:", err);
    process.exit(1);
  }
}

start();
