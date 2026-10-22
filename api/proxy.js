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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        // Lấy dữ liệu dưới dạng text trước để kiểm tra định dạng
        const textResponse = await response.text();

        try {
            // Thử phân tích xem có phải là JSON hợp lệ không
            const data = JSON.parse(textResponse);
            return res.status(response.status).json(data);
        } catch (e) {
            // Nếu trả về HTML (lỗi 404, 500 hoặc bị chặn), trả về thông báo chi tiết
            return res.status(502).json({ 
                error: "Upstream API returned HTML instead of JSON", 
                preview: textResponse.substring(0, 200) 
            });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
