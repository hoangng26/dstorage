import { fetchTemporaryFilesToServer, getTemporaryFilesOfServer } from '@/lib/file';
import NextCors from 'nextjs-cors';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  res.status(200).json({
    message: 'Server is running...',
  });

  if (req.method === 'POST') {
    const requestServer = req.body.ipAddress;
    const temporaryFiles = await getTemporaryFilesOfServer(requestServer);
    if (!temporaryFiles || temporaryFiles.length === 0) {
      return;
    }
    fetchTemporaryFilesToServer(requestServer);
  }
}
