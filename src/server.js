const path = require("path");
const express = require("express");
const postsRouter = require("./routes/posts");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/posts", postsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DevBlog API running on port ${PORT}`);
});

module.exports = app;
