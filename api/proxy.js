module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'Missing target url' });
    }

    try {
        const targetUrl = decodeURIComponent(url);
        const response = await fetch(targetUrl, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'ComicVerseApp/2.0 (contact@comicverse.local)'
            }
        });

        const contentType = response.headers.get('content-type') || '';

        // Nếu là ảnh hoặc file nhị phân, trả về Buffer trực tiếp qua res.end()
        if (contentType.includes('image') || contentType.includes('application/octet-stream')) {
            const arrayBuffer = await response.arrayBuffer();
            res.setHeader('Content-Type', contentType);
            return res.status(response.status).end(Buffer.from(arrayBuffer));
        }

        const textResponse = await response.text();

        try {
            const data = JSON.parse(textResponse);
            return res.status(response.status).json(data);
        } catch (e) {
            return res.status(502).json({ 
                error: "Upstream API returned non-JSON", 
                preview: textResponse.substring(0, 200) 
            });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
