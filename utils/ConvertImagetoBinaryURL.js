const fetchDataWithRetry = require("./fetchDataWithRetry");

async function ConvertImagetoBinaryURL(imagesrc) {
    try {
        const response = await fetchDataWithRetry({ url: imagesrc, params: { responseType: 'arraybuffer' } });
        if (response.success) {
            const imageBuffer = Buffer.from(response.data);
            const dataURL = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            return { success: true, dataURL, buffer: imageBuffer };
        } else {
            console.error('Error downloading image:', response);
            return { success: false, dataURL: null };
        }
    } catch (error) {
        console.error('Error downloading image:', error);
        return { success: false, dataURL: null };
    }
}

module.exports = ConvertImagetoBinaryURL;

// ConvertImagetoBinaryURL('https://cdn1.sexvid.xxx/contents/photos/main/2250x450/10000/10643/167783.jpg').then();
