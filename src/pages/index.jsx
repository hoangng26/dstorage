import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRef, useState } from 'react';

export default function Home({ fileNames }) {
  const [fileUpload, setFileUpload] = useState(null);
  const [renderedFilenames, setRenderedFilenames] = useState(fileNames);
  const formRef = useRef();

  const handleUploadEvent = (event) => {
    event.preventDefault();
    if (!fileUpload) {
      return;
    }
    const data = new FormData();
    data.append('file', fileUpload);

    axios
      .post('/api/upload', data)
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
    axios
      .get('/api/read')
      .then(({ data }) => {
        setRenderedFilenames((olđData) => ({
          ...olđData,
          '192.168.1.4:3000': data,
        }));
      })
      .catch((error) => {
        console.error(error);
      });
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
          {/* {renderedFilenames.map((fileName) => (
            <li key={fileName} className="flex gap-8 items-center">
              <a href={`/api/download/${fileName}`} target="_blank">
                <span>{fileName}</span>
              </a>
              <button
                onClick={() => handleDeleleEvent(fileName)}
                className="px-4 py-1 ml-4 border border-solid border-red-400 text-red-500"
              >
                Delete
              </button>
            </li>
          ))} */}
          {Object.keys(renderedFilenames).map((item) => (
            <div key={item}>
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
  const localFileNames = await axios.get('http://192.168.1.4:3000/api/read');
  const fileNames = await axios.get('http://54.254.236.159/api/read');
  return {
    props: {
      fileNames: {
        '192.168.1.4:3000': localFileNames.data || [],
        '54.254.236.159': fileNames.data || [],
      },
    },
  };
}
