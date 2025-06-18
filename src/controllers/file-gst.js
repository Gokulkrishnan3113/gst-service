const { fileGstService } = require('../services/file-gst');

async function fileGstHandler(req, res) {
    try {
        const result = await fileGstService(req.body);
        if (result.error) {
            return res.status(result.status || 400).json({ error: result.error });
        }

        res.status(result.status || 200).json(result);
    } catch (error) {
        console.error('Error filing GST:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { fileGstHandler };
