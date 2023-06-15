import ListAllFiles from '@/components/ListAllFiles';
import ListFiles from '@/components/ListFiles';
import ListServers from '@/components/ListServers';
import Navbar from '@/components/Navbar';
import { createECBCTable, getListFilesFromAllServers } from '@/lib/file';
import { getActiveServer, getAllServers, updateActiveServer } from '@/lib/servers';
import { Button, Layout, Modal } from 'antd';
import axios from 'axios';
import Head from 'next/head';
import { useRef, useState } from 'react';

const { Header, Sider, Content, Footer } = Layout;

export default function Home({ servers, activeServers, listServersSaveFiles, listFilesOnServers }) {
  const [fileUpload, setFileUpload] = useState(null);
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [showAllFile, setShowAllFile] = useState(true);

  const [listServersState, setListServersState] = useState(listServersSaveFiles);
  const [listFilesState, setListFilesState] = useState(listFilesOnServers);

  const [showUpload, setShowUpload] = useState(false);

  const formRef = useRef();

  const handleUploadEvent = async () => {
    if (!fileUpload || !selectedServer) {
      return;
    }
    const data = new FormData();
    data.append('file', fileUpload);

    if (activeServers.find((server) => server === selectedServer)) {
      await axios
        .post(`http://${selectedServer}/api/upload`, data)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      data.append('server', selectedServer);
      await axios
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
    let { data } = await axios.get(`/api/get-all-files`);
    const { listFiles, listServers } = data;

    setListFilesState(listFiles);
    setListServersState(listServers);
  };

  const handleSelectServer = ({ key, keyPath, domEvent }) => {
    if (keyPath[0]) {
      setSelectedServer(key);
      setShowAllFile(false);
    } else {
      setShowAllFile(true);
    }
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
              <ListServers servers={servers} onSelectServer={handleSelectServer} />
            </Sider>

            <Content className="px-8">
              {!showAllFile && (
                <>
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
                    listFiles={listServersState[selectedServer]}
                    onUpdateListFiles={handleUpdateListFiles}
                  />
                </>
              )}
              {showAllFile && (
                <ListAllFiles
                  listFiles={listFilesState}
                  activeServers={activeServers}
                  onUpdateListFiles={handleUpdateListFiles}
                />
              )}
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

  const { listFilesOnServers, listServersSaveFiles } = await getListFilesFromAllServers();

  const ECBC_table = await createECBCTable();
  for (let item of ECBC_table) {
    // console.log(...item);
  }

  return {
    props: {
      servers,
      activeServers,
      listServersSaveFiles,
      listFilesOnServers,
    },
  };
}
