import {
  fetchDeleteFilesToServer,
  fetchTemporaryFilesToServer,
  getDeleteFilesOfServer,
  getFilesOnServer,
  getTemporaryFilesOfServer,
} from '@/lib/file';
import { checkNewServer } from '@/lib/servers';
import NextCors from 'nextjs-cors';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'POST') {
    const requestServer = req.body.ipAddress;

    if (await checkNewServer(requestServer)) {
      return;
    }

    const temporaryFiles = await getTemporaryFilesOfServer(requestServer);
    if (temporaryFiles && temporaryFiles.length > 0) {
      await fetchTemporaryFilesToServer(requestServer);
    }

    const tempDeleteFiles = await getDeleteFilesOfServer(requestServer);
    if (tempDeleteFiles && tempDeleteFiles.length > 0) {
      await fetchDeleteFilesToServer(requestServer);
    }

    await getFilesOnServer(requestServer);
  }

  res.status(200).json({
    message: 'Server is running...',
  });
}
