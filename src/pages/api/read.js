import { getFilesOnServer, readAllFilenames } from '@/lib/file';
import NextCors from 'nextjs-cors';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'GET') {
    const fileNames = await readAllFilenames();
    res.status(200).json(fileNames);
  } else if (req.method === 'POST') {
    const requestServer = req.body.server;
    try {
      const files = await getFilesOnServer(requestServer);
      res.status(200).json(files);
    } catch (error) {
      res.status(404).json({
        error: error.message,
      });
    }
  } else {
    res.status(404).json({
      message: 'Method not allowed',
    });
  }
}
