const express = require('express');
const router = express.Router();
const { getVendors, createVendor, modifyVendor, deleteVendor, appendMacToVendor } = require('../controllers/vendor');
const { verifyDefaultApiKey, verifyGstinWithApiKey } = require('../middleware/apikeyverifier');

router.get('/', verifyDefaultApiKey, getVendors); // GET /file-gst/vendors
router.post('/', verifyDefaultApiKey, createVendor);
router.post('/add-mac', verifyGstinWithApiKey, appendMacToVendor);
// router.patch('/:gstin', modifyVendor);
// router.delete('/:gstin', deleteVendor);

module.exports = router;