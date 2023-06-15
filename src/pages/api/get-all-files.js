import { getListFilesFromAllServers } from '@/lib/file';
import NextCors from 'nextjs-cors';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  try {
    const { listFilesOnServers, listServersSaveFiles } = await getListFilesFromAllServers();
    res.status(200).json({
      listFiles: listFilesOnServers,
      listServers: listServersSaveFiles,
    });
  } catch (error) {
    res.status(404).json({
      error: error.message,
    });
  }
}
