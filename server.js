const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from "public" folder
app.use(express.static('public'));

// Start server
app.listen(port, () => {
  console.log(`System running at http://localhost:${port}`);
});