const Jimp = require('jimp');
const qrCode = require('qrcode-reader');
const fs = require('fs');

function scanQrCodeImage(imagePath) {
  const buffer = fs.readFileSync(imagePath);
  
  Jimp.read(buffer, (err, image) => {
    if (err) {
      console.error(err);
      return;
    }

    const qr = new qrCode();
    qr.callback = (err, value) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Resultado del QR:', value.result); // Datos del QR
    };

    qr.decode(image.bitmap);
  });
}

// scanQrCodeImage('./path/to/qr-image.png');
