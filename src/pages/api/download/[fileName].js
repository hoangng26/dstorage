import { getLocalStoragePath, shortenName } from '@/lib/file';
import contentDisposition from 'content-disposition';
import fs from 'fs';
import NextCors from 'nextjs-cors';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'GET') {
    const { fileName } = req.query;
    const filePath = getLocalStoragePath(fileName);

    try {
      fs.readFileSync(filePath);
    } catch (error) {
      res.status(404).json({
        message: 'File not found',
      });
    }

    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Disposition': contentDisposition(shortenName(fileName)),
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else {
    res.status(404).json({
      message: 'Method not allowed',
    });
  }
}
