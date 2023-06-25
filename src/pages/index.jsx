import FileActions from '@/components/FileActions';
import ListAllFiles from '@/components/ListAllFiles';
import ListFiles from '@/components/ListFiles';
import ListServers from '@/components/ListServers';
import Navbar from '@/components/Navbar';
import UploadFile from '@/components/UploadFile';
import { getListFilesFromAllServers } from '@/lib/file';
import { getActiveServer, getAllServers } from '@/lib/servers';
import { CloudUploadOutlined } from '@ant-design/icons';
import { Layout, Result, Skeleton } from 'antd';
import axios from 'axios';
import Head from 'next/head';
import { useState } from 'react';

const { Header, Sider, Content, Footer } = Layout;

export default function Home({ servers, activeServers, listServersSaveFiles, listFilesOnServers }) {
  const [selectedServer, setSelectedServer] = useState('');
  const [showAllFile, setShowAllFile] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);

  const [listServersState, setListServersState] = useState(listServersSaveFiles);
  const [listFilesState, setListFilesState] = useState(listFilesOnServers);

  const handleUpdateListFiles = async () => {
    setFileLoading(true);
    let { data } = await axios.get(`/api/get-all-files`);
    const { listFiles, listServers } = data;

    setListFilesState(listFiles);
    setListServersState(listServers);
    setFileLoading(false);
  };

  const handleSelectServer = ({ key, keyPath, domEvent }) => {
    setSelectedServer(key);
    handleUpdateSelectedFiles('', '', true, true);
    if (keyPath[0]) {
      setShowAllFile(false);
    } else {
      setShowAllFile(true);
    }
  };

  const handleUpdateSelectedFiles = (fileName, servers, remove, all = false) => {
    if (!remove) {
      setSelectedFiles((prevState) => [
        ...prevState,
        {
          fileName,
          servers,
        },
      ]);
    } else if (all) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles((prevState) => prevState.filter((file) => file.fileName !== fileName));
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

            <Content className="px-8 h-full w-full">
              <FileActions
                activeServers={activeServers}
                selectedServer={selectedServer}
                listFiles={listFilesState}
                selectedFiles={selectedFiles}
                onUpdateListFiles={handleUpdateListFiles}
                onUpdateSelectedFiles={handleUpdateSelectedFiles}
              />

              <Skeleton
                active
                loading={fileLoading}
                paragraph={{
                  rows: 10,
                }}
              />

              {!fileLoading &&
                ((!selectedServer && !listFilesState.length) ||
                  (activeServers.includes(selectedServer) && listServersState[selectedServer].length === 0)) && (
                  <Result
                    icon={<CloudUploadOutlined />}
                    title="Upload your files here! 👇"
                    extra={
                      <UploadFile
                        activeServers={activeServers}
                        selectedServer={selectedServer}
                        onUpdateListFiles={handleUpdateListFiles}
                      />
                    }
                  />
                )}

              {selectedServer && !activeServers.includes(selectedServer) && (
                <Result status="500" title="Inactive" subTitle="Sorry, server is inactive. Please come back later." />
              )}

              {!showAllFile && !fileLoading && (
                <>
                  <ListFiles
                    server={[selectedServer]}
                    listFiles={
                      selectedServer && activeServers.includes(selectedServer) ? listServersState[selectedServer] : []
                    }
                    onUpdateListFiles={handleUpdateListFiles}
                    selectedFiles={selectedFiles}
                    onUpdateSelectedFiles={handleUpdateSelectedFiles}
                  />
                </>
              )}

              {showAllFile && !fileLoading && (
                <>
                  <ListAllFiles
                    listFiles={listFilesState}
                    activeServers={activeServers}
                    onUpdateListFiles={handleUpdateListFiles}
                    selectedFiles={selectedFiles}
                    onUpdateSelectedFiles={handleUpdateSelectedFiles}
                  />
                </>
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
  const activeServers = (await getActiveServer()).map((server) => server.address);

  const { listFilesOnServers, listServersSaveFiles } = await getListFilesFromAllServers(true);

  return {
    props: {
      servers,
      activeServers,
      listServersSaveFiles,
      listFilesOnServers,
    },
  };
}
