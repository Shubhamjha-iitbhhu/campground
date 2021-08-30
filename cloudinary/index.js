const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.c1,
    api_key: process.env.c2,
    api_secret: process.env.c3
});
const storage = new CloudinaryStorage({
    cloudinary : cloudinary,
    params: {
        folder: 'YelpCamp_MrSKJ',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

// console.log(storage);

module.exports = {
    cloudinary,
    storage
}