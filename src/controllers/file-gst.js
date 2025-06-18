const { fileGstService } = require('../services/file-gst');

async function fileGstHandler(req, res) {
    try {
        const result = await fileGstService(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error filing GST:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { fileGstHandler };
