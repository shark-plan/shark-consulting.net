const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const nodemailer = require("nodemailer"); //
const moment = require("moment-timezone");
require("dotenv").config();

const router = express.Router();

// POST /signup
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /signin
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  // Setup mail transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  // Get current date and time in English-readable format in Qatar timezone
  const now = moment.tz("Asia/Qatar").format("YYYY-MM-DD hh:mm:ss A");

  try {
    const user = await User.findOne({ username });
    if (!user) {
      // Send failure email
      await transporter.sendMail({
        from: `"shark-plan" <${process.env.EMAIL}>`,
        to: process.env.EMAIL,
        subject: `محاولة تسجيل دخول فاشلة - ${now}`,
        html: `
          <div dir="rtl" style="text-align: right; font-family: system-ui, Arial, sans-serif; font-size: 16px;">
            <p>تمت محاولة تسجيل دخول فاشلة للمستخدم: <strong>${username}</strong></p>
            <p>التاريخ والوقت: ${now}</p>
          </div>
        `,
      });

      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Send failure email
      await transporter.sendMail({
        from: `"shark-plan" <${process.env.EMAIL}>`,
        to: process.env.EMAIL,
        subject: `محاولة تسجيل دخول فاشلة - ${now}`,
        html: `
          <div dir="rtl" style="text-align: right; font-family: system-ui, Arial, sans-serif; font-size: 16px;">
            <p>تمت محاولة تسجيل دخول فاشلة للمستخدم: <strong>${username}</strong></p>
            <p>التاريخ والوقت: ${now}</p>
          </div>
        `,
      });

      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send success email
    await transporter.sendMail({
      from: `"shark-plan" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      subject: `تسجيل دخول ناجح - ${now}`,
      html: `
        <div dir="rtl" style="text-align: right; font-family: system-ui, Arial, sans-serif; font-size: 16px;">
          <p>تم تسجيل دخول ناجح للمستخدم: <strong>${username}</strong></p>
          <p>التاريخ والوقت: ${now}</p>
        </div>
      `,
    });

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
