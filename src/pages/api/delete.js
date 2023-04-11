import fs from 'fs/promises';
import path from 'path';

const storagePath = path.join(process.cwd(), 'storage');

export default async function handler(req, res, next) {
  if (req.method === 'DELETE') {
    const fileName = req.body.fileName;
    fs.unlink(`${storagePath}/${fileName}`, (err) => {
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
