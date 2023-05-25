import fs from 'fs';
import NextCors from 'nextjs-cors';
import path from 'path';

const storagePath = path.join(process.cwd(), 'storage');

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
    const filePath = `${storagePath}/${fileName}`;
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Length': stat.size,
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else {
    res.status(404).json({
      message: 'Method not allowed',
    });
  }
}
