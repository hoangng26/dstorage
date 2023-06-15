import ListAllFiles from '@/components/ListAllFiles';
import ListFiles from '@/components/ListFiles';
import ListServers from '@/components/ListServers';
import Navbar from '@/components/Navbar';
import ServerUpload from '@/components/ServerUpload';
import UploadFile from '@/components/UploadFile';
import { getListFilesFromAllServers } from '@/lib/file';
import { getActiveServer, getAllServers, updateActiveServer } from '@/lib/servers';
import { Layout } from 'antd';
import axios from 'axios';
import Head from 'next/head';
import { useState } from 'react';

const { Header, Sider, Content, Footer } = Layout;

export default function Home({ servers, activeServers, listServersSaveFiles, listFilesOnServers }) {
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [showAllFile, setShowAllFile] = useState(true);

  const [listServersState, setListServersState] = useState(listServersSaveFiles);
  const [listFilesState, setListFilesState] = useState(listFilesOnServers);

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
                  <ServerUpload
                    activeServers={activeServers}
                    selectedServer={selectedServer}
                    onUpdateListFiles={handleUpdateListFiles}
                  />

                  <ListFiles
                    server={selectedServer}
                    listFiles={listServersState[selectedServer]}
                    onUpdateListFiles={handleUpdateListFiles}
                  />
                </>
              )}

              {showAllFile && (
                <>
                  <UploadFile activeServers={activeServers} onUpdateListFiles={handleUpdateListFiles} />

                  <ListAllFiles
                    listFiles={listFilesState}
                    activeServers={activeServers}
                    onUpdateListFiles={handleUpdateListFiles}
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
  await updateActiveServer();
  const activeServers = getActiveServer().map((server) => server.address);

  const { listFilesOnServers, listServersSaveFiles } = await getListFilesFromAllServers();

  return {
    props: {
      servers,
      activeServers,
      listServersSaveFiles,
      listFilesOnServers,
    },
  };
}
