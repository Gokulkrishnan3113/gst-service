const express = require('express');
const { getVendorsHandler, createVendorHandler } = require('../controllers/vendor-controller');
const { verifyDefaultApiKey } = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/', verifyDefaultApiKey, getVendorsHandler);
router.post('/', verifyDefaultApiKey, createVendorHandler);

module.exports = router;