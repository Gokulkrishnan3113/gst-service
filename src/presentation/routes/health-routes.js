const express = require('express');
const { healthCheckHandler } = require('../controllers/health-controller');

const router = express.Router();

router.get('/', healthCheckHandler);

module.exports = router;