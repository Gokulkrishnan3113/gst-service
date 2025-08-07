const express = require('express');
const router = express.Router();
const { getVendors, createVendor, modifyVendor, deleteVendor, appendMacToVendor } = require('../controllers/vendor');
const { verifyDefaultApiKey, verifyAuth } = require('../middleware/apikeyverifier');
const { decryptRequestBody } = require('../middleware/decrypt-body')


router.get('/', verifyDefaultApiKey(false), getVendors); // GET /file-gst/vendors
router.post('/', verifyDefaultApiKey(true), createVendor);
router.post('/add-mac', decryptRequestBody, verifyAuth, appendMacToVendor);
// router.patch('/:gstin', modifyVendor);
// router.delete('/:gstin', deleteVendor);

module.exports = router;