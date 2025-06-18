const express = require('express');
const router = express.Router();
const { getVendors, createVendor, modifyVendor, deleteVendor } = require('../controllers/vendor');

router.get('/', (req, res) => {
    res.send('Use POST /file-gst to file GST');
});

router.get('/vendors', getVendors); // GET /file-gst/vendors
// router.post('/vendors', createVendor);
// router.patch('/vendors/:gstin', modifyVendor);
// router.delete('/vendors/:gstin', deleteVendor);

module.exports = router;