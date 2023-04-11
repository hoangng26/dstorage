import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { readAllFilenames } from './lib/file';

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

  const handleDeleleEvent = (fileName) => {
    axios
      .delete('/api/delete', {
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

  const handleUpdateFilenames = () => {
    axios
      .get('/api/read')
      .then(({ data }) => {
        setRenderedFilenames(data);
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

        <div className="w-full my-8">
          <a
            href="/storage/1920x1080-someday-or-oneday.jpg"
            target="_blank"
            className="px-4 py-1 ml-4 border border-solid border-gray-400"
          >
            Download
          </a>
        </div>

        <ul className="w-full mt-8 flex flex-col gap-4">
          {renderedFilenames.map((fileName) => (
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
          ))}
        </ul>

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
  const fileNames = await readAllFilenames();
  return {
    props: {
      fileNames: fileNames,
    },
  };
}
