const express = require('express');
const router = express.Router();
const { getVendors, createVendor, modifyVendor, deleteVendor } = require('../controllers/vendor');

router.get('/', getVendors); // GET /file-gst/vendors
router.post('/', createVendor);
// router.patch('/:gstin', modifyVendor);
// router.delete('/:gstin', deleteVendor);

module.exports = router;