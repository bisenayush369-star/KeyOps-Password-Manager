import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// ---- Mongo ----
const client = new MongoClient(process.env.MONGO_URI);

let passwordsCollection; // SINGLE source of truth

async function startServer() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await client.connect();

    const db = client.db("keyops");
    passwordsCollection = db.collection("passwords");

    console.log("✅ MongoDB connected");

    // -------- ROUTES (AFTER DB CONNECT) --------

    app.get("/", (req, res) => {
      res.send("Server is running 🚀");
    });

    app.get("/passwords", async (req, res) => {
      try {
        const data = await passwordsCollection.find({}).toArray();
        res.json(data);
      } catch (err) {
        console.error("GET /passwords error:", err);
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
        console.error("POST /passwords error:", err);
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
        console.error("DELETE /passwords error:", err);
        res.status(500).json({ error: "Failed to delete password" });
      }
    });

    // -------- START SERVER LAST --------
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

startServer();
