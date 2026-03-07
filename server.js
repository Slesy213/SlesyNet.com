const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const REVIEWS_FILE = path.join(__dirname, "reviews.json");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureReviewsFile() {
  if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, "[]", "utf8");
  }
}

function readReviews() {
  ensureReviewsFile();
  try {
    const raw = fs.readFileSync(REVIEWS_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function writeReviews(reviews) {
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf8");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.get("/api/reviews", (req, res) => {
  const reviews = readReviews().sort((a, b) => b.createdAt - a.createdAt);
  res.json({ success: true, reviews });
});

app.post("/api/reviews", (req, res) => {
  const { name, comment, rating } = req.body || {};

  const cleanName = escapeHtml(String(name || "").trim()).slice(0, 30);
  const cleanComment = escapeHtml(String(comment || "").trim()).slice(0, 400);
  const cleanRating = Number(rating);

  if (!cleanName || cleanName.length < 2) {
    return res.status(400).json({ success: false, message: "İsim en az 2 karakter olmalı." });
  }

  if (!cleanComment || cleanComment.length < 5) {
    return res.status(400).json({ success: false, message: "Yorum en az 5 karakter olmalı." });
  }

  if (![1, 2, 3, 4, 5].includes(cleanRating)) {
    return res.status(400).json({ success: false, message: "Yıldız 1 ile 5 arasında olmalı." });
  }

  const reviews = readReviews();

  const newReview = {
    id: Date.now().toString(),
    name: cleanName,
    comment: cleanComment,
    rating: cleanRating,
    createdAt: Date.now()
  };

  reviews.unshift(newReview);
  writeReviews(reviews.slice(0, 300));

  res.json({ success: true, review: newReview });
});

app.listen(PORT, () => {
  ensureReviewsFile();
  console.log(`Site aktif: http://localhost:${PORT}`);
});
