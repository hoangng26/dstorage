import { createECBCTable, getBlankPosition, getECBCParameters } from '@/lib/file';
import { getAllServers } from '@/lib/servers';
import NextCors from 'nextjs-cors';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'GET') {
    const ECBC_table = await createECBCTable();
    const { ECBC_m: m, ECBC_n: n, ECBC_t: t } = await getECBCParameters();
    const availablePosition = await getBlankPosition();

    const table = ECBC_table.map((item) => item[(availablePosition >= 0 ? availablePosition : n) % (m * t)]);

    const listServersSaveFiles = await getAllServers();
    const listServers = Object.values(listServersSaveFiles);
    const chosenServers = table.map((item, index) => item && listServers[index].address);

    res.status(200).json(chosenServers.filter((server) => Boolean(server)));
  } else {
    res.status(404).json({
      message: 'Method not allowed.',
    });
  }
}
