const { createCanvas, loadImage } = require('canvas');
const nsfwjs = require('nsfwjs');

function classifyImages(buffer) {
    return new Promise(async (resolve, reject) => {
        const image = await loadImage(buffer);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const model = await nsfwjs.load();
        const predictions = await model.classify(canvas);

        let output = {}
        predictions.forEach(prediction => output[prediction.className] = prediction.probability);
        resolve(output)

    })
}

module.exports = classifyImages