import servers from '@/static/servers';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRef, useState } from 'react';

export default function Home({ fileNames }) {
  const [fileUpload, setFileUpload] = useState(null);
  const [serverUpload, setServerUpload] = useState('');
  const [renderedFilenames, setRenderedFilenames] = useState(fileNames);
  const formRef = useRef();

  const handleUploadEvent = (event) => {
    event.preventDefault();
    if (!fileUpload || !serverUpload) {
      return;
    }
    const data = new FormData();
    data.append('file', fileUpload);

    axios
      .post(`http://${serverUpload}/api/upload`, data)
      .then((response) => {
        console.log(response);
        handleUpdateFilenames();
        formRef.current.reset();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleleEvent = (ipAddress, fileName) => {
    axios
      .delete(`http://${ipAddress}/api/delete`, {
        data: {
          fileName,
        },
      })
      .then((response) => {
        console.log(response.data);
        handleUpdateFilenames();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleUpdateFilenames = async () => {
    const fileNames = {};
    for (let server of servers) {
      let response = await axios.get(`http://${server}/api/read`);
      fileNames[server] = response.data || [];
    }
    setRenderedFilenames(fileNames);
  };

  return (
    <>
      <Head>
        <title>Distributed Storage</title>
      </Head>
      <main className="w-1/2 mx-auto">
        <Link href="/">
          <h1 className="font-bold text-2xl">Distributed Storage</h1>
        </Link>

        <div className="w-full mt-8 flex flex-row gap-8">
          {Object.keys(renderedFilenames).map((item) => (
            <div key={item} className="flex flex-col gap-4">
              <h1 className="font-bold">{item}</h1>
              {renderedFilenames[item].map((fileName) => (
                <li key={fileName} className="flex gap-8 items-center">
                  <a href={`http://${item}/api/download/${fileName}`} target="_blank">
                    <span>{fileName}</span>
                  </a>
                  <button
                    onClick={() => handleDeleleEvent(item, fileName)}
                    className="px-4 py-1 ml-4 border border-solid border-red-400 text-red-500"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </div>
          ))}
        </div>

        <form ref={formRef} className="mt-8" onSubmit={handleUploadEvent}>
          <div className="mb-4">
            <label htmlFor="server">Choose a server:</label>
            <select
              name="server"
              id="server"
              className="border border-black ml-4"
              onChange={(event) => setServerUpload(event.target.value)}
            >
              <option value="" selected hidden>
                Choose a server
              </option>
              {servers.map((server, index) => (
                <option key={`server-${index}`} value={server}>
                  {server}
                </option>
              ))}
            </select>
          </div>
          <input
            type="file"
            name="file-upload"
            id="file-upload"
            onChange={(event) => setFileUpload(event.target.files[0])}
          />
          <button className="px-4 py-1 ml-4 border border-solid border-gray-400">Submit</button>
        </form>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const fileNames = {};
  for (let server of servers) {
    let response = await axios.get(`http://${server}/api/read`);
    fileNames[server] = response.data || [];
  }
  return {
    props: {
      fileNames,
    },
  };
}
