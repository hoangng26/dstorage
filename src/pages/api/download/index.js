import { getFilesFromServers_HopCroft_Karp } from '@/lib/calECBC';
import { findIndexOnAllServers, shortenName } from '@/lib/file';
import { getAllServers } from '@/lib/servers';
import NextCors from 'nextjs-cors';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'POST') {
    const listFiles = req.body;

    if (!listFiles || listFiles.length === 0) {
      return;
    }

    const listIndex = await Promise.all(
      listFiles.map(async (fileName) => ({
        fileName,
        index: await findIndexOnAllServers(shortenName(fileName)),
      })),
    );

    const listIndexServers = await getFilesFromServers_HopCroft_Karp(listIndex.map((item) => item.index));
    const servers = await getAllServers();

    const response = listIndexServers.map((server, index) => ({
      server: servers[index].address,
      listFiles: server.map((file) => listIndex.find((item) => item.index === file).fileName),
    }));

    res.status(200).json(response);
  } else {
    res.status(404).json({
      message: 'Method not allowed',
    });
  }
}
