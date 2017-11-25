const express = require('express');

//


var app = express();

app.use((req, res, next) => {

  console.log(JSON.stringify({
    ip: req.ip,
    method: req.method,
    url: req.originalUrl
  }));
  next();
});

app.use(express.static("www"));

app.listen(80, function () {

  console.log("see http://localhost:80/");
});
