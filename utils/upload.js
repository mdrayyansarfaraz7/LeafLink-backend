import multer from 'multer'
import {CloudinaryStorage} from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js'


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'leaflink_items', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

export default upload;