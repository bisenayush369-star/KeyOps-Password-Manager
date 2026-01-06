import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== ENV =====
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in environment");
  process.exit(1);
}

// ===== MONGODB =====
const client = new MongoClient(MONGO_URI);
let passwordsCollection;

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/passwords", async (req, res) => {
  try {
    const data = await passwordsCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("❌ Fetch error:", err);
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
    console.error("❌ Insert error:", err);
    res.status(500).json({ error: "Failed to save password" });
  }
});

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

// ===== START SERVER ONLY AFTER DB CONNECT =====
async function start() {
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();

    const db = client.db("keyops");
    passwordsCollection = db.collection("passwords");

    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB failed:", err);
    process.exit(1);
  }
}

start();
