const express = require('express');
require('dotenv').config();
const path = require('path');
const app = express();
const port = process.env.PORT || 4500;

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
