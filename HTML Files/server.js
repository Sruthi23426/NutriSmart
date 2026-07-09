require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ====================== CORS ======================
app.use(cors());

app.use(express.json());
app.use(express.static(__dirname));

// ====================== MongoDB ======================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
  

// ====================== SCHEMA ======================
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  age: Number,
  height: Number,
  weight: Number,
  bmi: Number,
  city: String,
  illness: String,
  diet: String,
  activity: String,
  region: String,

  // ✅ Progress tracking
  progress: [
    {
      week: Number,
      score: Number
    }
  ]
});

const User = mongoose.model("User", userSchema);

// ====================== REGISTER ======================
app.post("/register", async (req, res) => {
  const { name, email, age } = req.body;

  if (!name || !email || !age) {
    return res.json({
      success: false,
      message: "Please fill all fields"
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already registered"
      });
    }

    const newUser = new User({
      name,
      email,
      age,
      progress: []
    });

    await newUser.save();

    res.json({
      success: true,
      message: "Registered Successfully"
    });

  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "Error saving user"
    });
  }
});

// ====================== LOGIN ======================
app.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "Email required"
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      res.json({
        success: true,
        message: "Login successful"
      });
    } else {
      res.json({
        success: false,
        message: "User not found"
      });
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

// ====================== UPDATE PROFILE ======================
app.post("/updateProfile", async (req, res) => {
  const {
    email,
    height,
    weight,
    city,
    illness,
    diet,
    activity,
    region
  } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    if (height) user.height = height;
    if (weight) user.weight = weight;

    if (height && weight) {
      user.bmi = parseFloat(
        (weight / ((height / 100) ** 2)).toFixed(1)
      );
    }

    if (city) user.city = city;
    if (illness) user.illness = illness;
    if (diet) user.diet = diet;
    if (activity) user.activity = activity;
    if (region) user.region = region;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      bmi: user.bmi
    });

  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "Error updating profile"
    });
  }
});

// ====================== SAVE PROGRESS ======================
app.post("/saveProgress", async (req, res) => {
  const { email, score } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.progress) user.progress = [];

    user.progress.push({
      week: user.progress.length + 1,
      score: score
    });

    await user.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

// ====================== GET PROGRESS ======================
app.get("/getProgress/:email", async (req, res) => {
  try {
    let user = await User.findOne({
      email: req.params.email
    });

    if (!user) return res.json([]);

    res.json(user.progress);

  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
});

// ====================== SERVER ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


