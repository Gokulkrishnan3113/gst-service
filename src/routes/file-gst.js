const express = require('express');
const router = express.Router();
const { fileGstHandler } = require('../controllers/file-gst');

router.post('/file-gst', fileGstHandler);

module.exports = router;
