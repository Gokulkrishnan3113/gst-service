const express = require('express');
const router = express.Router();
const { getVendors, createVendor, modifyVendor, deleteVendor, appendMacToVendor } = require('../controllers/vendor');
const { verifyDefaultApiKey, verifyAuth } = require('../middleware/apikeyverifier');

router.get('/', verifyDefaultApiKey, getVendors); // GET /file-gst/vendors
router.post('/', verifyDefaultApiKey, createVendor);
router.post('/add-mac', verifyAuth, appendMacToVendor);
// router.patch('/:gstin', modifyVendor);
// router.delete('/:gstin', deleteVendor);

module.exports = router;