const config = require('../config/config');
const express = require('express');
const stripe = require('../libs/stripe');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});


module.exports = router;
