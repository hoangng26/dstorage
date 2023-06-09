import ListFiles from '@/components/ListFiles';
import ListServers from '@/components/ListServers';
import Navbar from '@/components/Navbar';
import { getFilesOnServer } from '@/lib/file';
import { getActiveServer, getAllServers, updateActiveServer } from '@/lib/servers';
import { Button, Layout, Modal } from 'antd';
import axios from 'axios';
import Head from 'next/head';
import { useRef, useState } from 'react';

const { Header, Sider, Content, Footer } = Layout;

export default function Home({ servers, activeServers, fileNames }) {
  const [fileUpload, setFileUpload] = useState(null);
  const [selectedServer, setSelectedServer] = useState(servers[0]);

  const [renderedFilenames, setRenderedFilenames] = useState(fileNames);
  const [showUpload, setShowUpload] = useState(false);

  const formRef = useRef();

  const handleUploadEvent = () => {
    if (!fileUpload || !selectedServer) {
      return;
    }
    const data = new FormData();
    data.append('file', fileUpload);

    if (activeServers.find((server) => server === selectedServer)) {
      axios
        .post(`http://${selectedServer}/api/upload`, data)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      data.append('server', selectedServer);
      axios
        .post(`/api/upload`, data)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    handleUpdateListFiles();
    formRef.current.reset();
    setFileUpload(null);
    setShowUpload(false);
  };

  const handleUpdateListFiles = async () => {
    const fileNames = {};
    for (let server of activeServers) {
      let response = await axios.get(`http://${server}/api/read`);
      fileNames[server] = response.data || [];
    }

    setRenderedFilenames((prevState) => ({
      ...prevState,
      ...fileNames,
    }));
  };

  const handleSelectServer = ({ key, keyPath, domEvent }) => {
    setSelectedServer(key);
  };

  return (
    <>
      <Head>
        <title>Distributed Storage</title>
      </Head>
      <main>
        <Layout>
          <Header className="h-16 bg-blue-500 flex items-center justify-between px-8 text-slate-50 absolute w-full">
            <Navbar />
          </Header>

          <Layout className="h-screen pt-16">
            <Sider className="bg-transparent">
              <ListServers
                activeServers={servers}
                selectedServer={selectedServer}
                onSelectServer={handleSelectServer}
              />
            </Sider>

            <Content className="px-8">
              <div className="mt-8">
                <div className="font-bold pb-4 text-xl">IP Address: {selectedServer}</div>
                <Button type="primary" size="large" onClick={() => setShowUpload(!showUpload)}>
                  Upload
                </Button>
              </div>

              <Modal
                title="Upload File"
                open={showUpload}
                onOk={handleUploadEvent}
                onCancel={() => {
                  formRef.current.reset();
                  setShowUpload(false);
                }}
              >
                <form ref={formRef} className="mt-8">
                  <input
                    type="file"
                    name="file-upload"
                    id="file-upload"
                    onChange={(event) => setFileUpload(event.target.files[0])}
                  />
                </form>
              </Modal>

              <ListFiles
                server={selectedServer}
                listFiles={renderedFilenames[selectedServer]}
                onUpdateListFiles={handleUpdateListFiles}
              />
            </Content>
          </Layout>
        </Layout>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const servers = getAllServers().map((server) => server.address);
  await updateActiveServer();
  const activeServers = getActiveServer().map((server) => server.address);
  const fileNames = {};

  for (let server of servers) {
    fileNames[server] = await getFilesOnServer(server);
  }

  return {
    props: {
      servers,
      activeServers,
      fileNames,
    },
  };
}
