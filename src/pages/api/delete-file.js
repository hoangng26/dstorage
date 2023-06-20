import { deleteTemporaryFile, getListFilesFromAllServers, saveDeleteLogFile } from '@/lib/file';
import axios from 'axios';
import NextCors from 'nextjs-cors';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'DELETE') {
    const fileName = req.body.fileName;

    const { listFilesOnServers } = await getListFilesFromAllServers();

    const deleteFile = listFilesOnServers.find((file) => file.fileName === fileName);

    if (!fileName || !deleteFile) {
      res.status(400).json({
        message: 'File not found',
      });
      return;
    }

    const deleteServers = deleteFile.servers;

    const tempDeleteFiles = [];

    await Promise.all(
      deleteServers.map(async (server) => {
        await axios
          .delete(`http://${server}/api/delete`, {
            data: {
              fileName,
            },
          })
          .then((response) => {})
          .catch(async (error) => {
            tempDeleteFiles.push({ server, fileName });
          });
      }),
    );

    await deleteTemporaryFile(fileName);

    for (let file of tempDeleteFiles) {
      await saveDeleteLogFile(file.server, file.fileName);
    }

    res.status(200).json({
      message: `Deleted "${fileName}" from ${deleteServers.length} servers successfully.`,
    });
  } else {
    res.status(404).json({
      message: 'Method not allowed',
    });
  }
}
