import { saveUploadFile } from '@/lib/file';
import formidable from 'formidable';
import fs from 'fs/promises';
import NextCors from 'nextjs-cors';
import path from 'path';

const storagePath = path.join(process.cwd(), 'storage');

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: false,
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
      await fs.readdir(storagePath);
    } catch (error) {
      await fs.mkdir(storagePath);
    }

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      await saveUploadFile(files.file, fields.server);
    });

    res.json({ done: 'Ok' });
  } else {
    res.status(404).json({
      message: 'Method not allowed',
    });
  }
}
