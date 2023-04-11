import fs from 'fs';
import path from 'path';

const storagePath = path.join(process.cwd(), 'storage');

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res, next) {
  const { fileName } = req.query;
  const filePath = `${storagePath}/${fileName}`;
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Length': stat.size,
  });

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
}
