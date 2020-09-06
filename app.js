const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
var path = require('path');

app.use(express.static(path.join(__dirname, '')));

app.get('/', (req, res) => {
  res.send('index.html');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})