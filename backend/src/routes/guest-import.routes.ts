import express from 'express';
import multer from 'multer';
import { importGuestsFromExcel } from '../controllers/guest-import.controller';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/import', upload.single('file'), importGuestsFromExcel);

export default router;

