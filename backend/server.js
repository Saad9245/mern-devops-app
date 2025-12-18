const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// MIDDLEWARE (VERY IMPORTANT)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json()); // 👈 THIS FIXES 500 ERROR

// Private Network Access (PNA) preflight handler
// Browsers may send `Access-Control-Request-Private-Network` on OPTIONS
// and expect `Access-Control-Allow-Private-Network: true` in the response.
// Note: the requesting page must be served over HTTPS (secure context)
// for PNA to be allowed by modern browsers.
app.options('*', (req, res) => {
  if (req.headers['access-control-request-private-network']) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  return res.sendStatus(204);
});

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017/students";



mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Schema
const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Student = mongoose.model("Student", StudentSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Backend API is running");
});
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/students", async (req, res) => {
  try {
    const student = new Student({ name: req.body.name });
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
