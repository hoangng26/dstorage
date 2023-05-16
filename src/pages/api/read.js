import NextCors from 'nextjs-cors';
import { readAllFilenames } from '../../lib/file';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'GET') {
    const fileNames = await readAllFilenames();
    res.status(200).json(fileNames);
  } else {
    res.status(404).json({
      message: 'Method not allowed',
    });
  }
}
