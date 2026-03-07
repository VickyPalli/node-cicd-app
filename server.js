const express = require("express");

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Deployed with Jenkins POLLSCM trigger mechanism...🚀" });
});

app.get("/about", (req, res) => {
  res.send("About Page");
});

app.post("/data", (req, res) => {
  res.json({
    message: "Data received",
    data: req.body,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
