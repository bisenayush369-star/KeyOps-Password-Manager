import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

let passwordsCollection = null;

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ❌ BLOCK ROUTES IF DB NOT READY
app.get("/passwords", async (req, res) => {
  if (!passwordsCollection) {
    return res.status(503).json({ error: "Database not ready" });
  }

  try {
    const data = await passwordsCollection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("❌ Mongo fetch error:", err);
    res.status(500).json({ error: "Failed to fetch passwords" });
  }
});

async function startServer() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();

    const db = client.db("keyops");
    passwordsCollection = db.collection("passwords");

    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // ⛔ HARD FAIL
  }
}

startServer();
