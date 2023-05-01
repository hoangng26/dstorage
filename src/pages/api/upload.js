import fs from 'fs/promises';
import NextCors from 'nextjs-cors';
import path from 'path';
import { readFile } from '../../lib/file';

const storagePath = path.join(process.cwd(), 'storage');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  try {
    await fs.readdir(storagePath);
  } catch (error) {
    await fs.mkdir(storagePath);
  }

  await readFile(req);
  res.json({ done: 'Ok' });
}
