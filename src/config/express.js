const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("express-jwt");
const config = require("./config");
const app = express();

var glob = require("glob"),
  path = require("path"),
  cors = require("cors");

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

app.use(
  "/api/",
  jwt({
    secret: config.jwt.secret,
    credentialsRequired: false
  })
);

app.get("/", function(req, res) {
  res.jsonp({
    status: 200,
    message: "Server is running."
  });
});

glob
  .sync(path.join(__dirname, "../modules/**/models/*.js"))
  .forEach(function(file) {
    require(path.resolve(file));
  });

glob
  .sync(path.join(__dirname, "../modules/**/routes/*.js"))
  .forEach(function(file) {
    require(path.resolve(file))(app);
  });

glob
  .sync(path.join(__dirname, "../modules/**/strategy/*.js"))
  .forEach(function(file) {
    require(path.resolve(file))(app);
  });

glob
  .sync(path.join(__dirname, "../modules/**/policy/*.js"))
  .forEach(function(file) {
    require(path.resolve(file)).invokeRolesPolicies();
  });

module.exports = app;
