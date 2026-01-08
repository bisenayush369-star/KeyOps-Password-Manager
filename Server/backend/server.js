const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

// middleware
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

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

let passwordsCollection;

// routes (defined immediately)
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/passwords", async (req, res) => {
  const passwords = await passwordsCollection.find({}).toArray();
  res.json(passwords);
});

app.post("/passwords", async (req, res) => {
  const { website, username, password } = req.body;
  await passwordsCollection.insertOne({ website, username, password });
  res.json({ success: true });
});

// START SERVER FIRST (IMPORTANT)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// CONNECT TO DB SEPARATELY (SAFE FOR RENDER)
async function connectDB() {
  try {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db("keyops");
    passwordsCollection = db.collection("passwords");
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // ❌ NO process.exit() in production
  }
}

connectDB();
