import { saveUploadFile } from '@/lib/file';
import formidable from 'formidable';
import fs from 'fs';
import NextCors from 'nextjs-cors';
import path from 'path';

const storagePath = path.join(process.cwd(), 'storage');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'POST') {
    try {
      fs.readdirSync(storagePath);
    } catch (error) {
      fs.mkdirSync(storagePath);
    }

    return new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          reject(err);
        }
        await saveUploadFile(files.file, fields.server, fields.fileName);
        res.json({ message: 'Ok' });
        resolve({ fields, files });
      });
    });
  } else {
    res.status(404).json({
      message: 'Method not allowed',
    });
  }
}
