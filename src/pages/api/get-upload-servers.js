import { createECBCTable } from '@/lib/calECBC';
import { getBlankPosition, getListFilesFromAllServers } from '@/lib/file';
import { getAllServers } from '@/lib/servers';
import NextCors from 'nextjs-cors';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'GET') {
    const { ECBC_m: m, ECBC_n: n, ECBC_t: t, ECBC_table_origin } = await createECBCTable();
    const availablePosition = await getBlankPosition();
    const { listFilesOnServers: listFiles } = await getListFilesFromAllServers();

    const table = ECBC_table_origin.map((item) => item[availablePosition >= 0 ? availablePosition : listFiles.length]);

    const listServers = await getAllServers();
    const chosenServers = table.map((item, index) => item && listServers[index].address);

    res.status(200).json(chosenServers.filter((server) => Boolean(server)));
  } else {
    res.status(404).json({
      message: 'Method not allowed.',
    });
  }
}
