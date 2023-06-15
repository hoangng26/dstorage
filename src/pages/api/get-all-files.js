import { getListFilesFromAllServers } from '@/lib/file';

export default async function handler(req, res, next) {
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
