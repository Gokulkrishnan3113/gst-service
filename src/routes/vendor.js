const express = require('express');
const router = express.Router();
const { getVendors, createVendor, modifyVendor, deleteVendor } = require('../controllers/vendor');
const { verifyDefaultApiKey } = require('../middleware/apikeyverifier');

router.get('/', verifyDefaultApiKey, getVendors); // GET /file-gst/vendors
router.post('/', verifyDefaultApiKey, createVendor);
// router.patch('/:gstin', modifyVendor);
// router.delete('/:gstin', deleteVendor);

module.exports = router;