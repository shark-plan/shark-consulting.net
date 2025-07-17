require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

// Routes
const heroRoutes = require("./routers/hero");

const slidesRouter = require("./routers/Slides");
const previousWorks = require("./routers/previousWork");
const whyUsRouter = require("./routers/whuUs");
const aboutRouter = require("./routers/about");
const emailRouter = require("./routers/email");
const categoryRouter = require("./routers/category");
const fontRoutes = require("./routers/font");
const questionRoutes = require("./routers/question");
const loginRoutes = require("./routers/login");
const menuRoutes = require("./routers/menu");
const textContentRoutes = require("./routers/textContent");
const authenticateToken = require("./auth/auth");
const paperworkRoutes = require("./routers/paperwork");
const feedbacksRoutes = require("./routers/feedBack");
const UIRoutes = require("./routers/ui-state");
const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect(process.env.MONGOODB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use((req, res, next) => {
  if (
    req.headers["content-type"] === "application/json" &&
    Buffer.isBuffer(req.body)
  ) {
    try {
      req.body = JSON.parse(req.body.toString("utf8"));
    } catch (err) {
      console.error("Failed to parse JSON body:", err);
      return res.status(400).json({ error: "Invalid JSON format" });
    }
  }
  next();
});

app.get("/api/protected", authenticateToken, (req, res) => {
  res.status(200).json({ message: "This is protected data", user: req.user });
});

// Register Routes
app.use("/category", categoryRouter);
app.use("/email", emailRouter);
app.use("/about", aboutRouter);
app.use("/why-us", whyUsRouter);
app.use("/previous-works", previousWorks);
app.use("/slides", slidesRouter);
app.use("/fonts", fontRoutes);
app.use("/question", questionRoutes);
app.use("/user", loginRoutes);
app.use("/menu", menuRoutes);
app.use("/textContent", textContentRoutes);
app.use("/hero", heroRoutes);
app.use("/paperwork", paperworkRoutes);
app.use("/feedbacks", feedbacksRoutes);
app.use("/ui", UIRoutes);

app.listen("5005", () => {
  console.log("server is running on 5005");
});
