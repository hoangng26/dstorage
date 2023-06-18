import { getLocalStoragePath } from '@/lib/file';
import fs from 'fs';
import NextCors from 'nextjs-cors';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'DELETE') {
    const fileName = req.body.fileName;
    const filePath = getLocalStoragePath(fileName);

    try {
      fs.readFileSync(filePath);
    } catch (error) {
      res.status(404).json({
        message: 'File not found',
      });
    }

    fs.unlinkSync(filePath, (err) => {
      if (err) {
        throw err;
      } else {
        console.log('Deleted file: ' + fileName);
      }
    });

    res.status(200).json({
      message: 'Deleted',
    });
  } else {
    res.status(404).json({
      message: 'Method not allowed',
    });
  }
}
