const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let passwordsCollection;

async function start() {
  try {
    console.log("🔄 Connecting to MongoDB...");

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const db = client.db("keyops");
    passwordsCollection = db.collection("passwords");

    console.log("✅ MongoDB connected");

    // -------- ROUTES (ONLY AFTER DB READY) --------

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
      const { website, username, password } = req.body;

      if (!website || !username || !password) {
        return res.status(400).json({ error: "All fields required" });
      }

      await passwordsCollection.insertOne({ website, username, password });
      res.json({ success: true });
    });

    app.delete("/passwords/:id", async (req, res) => {
      await passwordsCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.json({ success: true });
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

start();
