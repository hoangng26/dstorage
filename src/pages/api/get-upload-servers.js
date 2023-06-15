import { createECBCTable, getListFilesFromAllServers } from '@/lib/file';
import NextCors from 'nextjs-cors';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'GET') {
    const ECBC_table = await createECBCTable();
    const table = ECBC_table.map((item) => item.pop());
    const { listServersSaveFiles } = await getListFilesFromAllServers();
    const listServers = Object.keys(listServersSaveFiles);
    const chosenServers = table.map((item, index) => item && listServers[index]);

    res.status(200).json(chosenServers.filter((server) => Boolean(server)));
  } else {
    res.status(404).json({
      message: 'Method not allowed.',
    });
  }
}
