const express = require("express");
const store = require("../postsStore");

const router = express.Router();

router.get("/", (req, res) => {
  const { desde, hasta } = req.query;
  const all = store.getAll();
  const filtered = store.filterByDate(all, desde, hasta);
  res.json(filtered);
});

router.get("/:id", (req, res) => {
  const post = store.getById(Number(req.params.id));
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json(post);
});

router.post("/", (req, res) => {
  const { title, author, content, publishedAt } = req.body;
  const post = store.create({ title, author, content, publishedAt });
  res.status(201).json(post);
});

router.put("/:id", (req, res) => {
  const post = store.update(Number(req.params.id), req.body);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json(post);
});

module.exports = router;
