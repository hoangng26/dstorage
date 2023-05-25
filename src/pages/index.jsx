import { getActiveServer, updateActiveServer } from '@/lib/servers';
import {
  CloudServerOutlined,
  FileFilled,
  FileImageFilled,
  FilePdfFilled,
  FileWordFilled,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Input, Layout, Menu, Modal } from 'antd';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRef, useState } from 'react';

const { Header, Sider, Content, Footer } = Layout;

export default function Home({ activeServers, fileNames }) {
  const [fileUpload, setFileUpload] = useState(null);
  const [selectedServer, setSelectedServer] = useState(activeServers[0]);

  const [renderedFilenames, setRenderedFilenames] = useState(fileNames);
  const [showUpload, setShowUpload] = useState(false);

  const formRef = useRef();

  const handleUploadEvent = () => {
    if (!fileUpload || !selectedServer) {
      return;
    }
    const data = new FormData();
    data.append('file', fileUpload);

    axios
      .post(`http://${selectedServer}/api/upload`, data)
      .then((response) => {
        console.log(response);
        handleUpdateFilenames();
        formRef.current.reset();
      })
      .catch((error) => {
        console.error(error);
      });
    setShowUpload(false);
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
    for (let server of activeServers) {
      let response = await axios.get(`http://${server}/api/read`);
      fileNames[server] = response.data || [];
    }
    setRenderedFilenames(fileNames);
  };

  const handleSelectServer = ({ key, keyPath, domEvent }) => {
    setSelectedServer(key);
  };

  const getFileIcon = (fileName) => {
    let extension = fileName.split('.').pop();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return <FileImageFilled className="text-5xl text-green-500" />;
      case 'doc':
      case 'docx':
        return <FileWordFilled className="text-5xl text-blue-500" />;
      case 'pdf':
        return <FilePdfFilled className="text-5xl text-red-500" />;
      default:
        return <FileFilled className="text-5xl text-blue-500" />;
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
            <Link href="/">
              <h1 className="font-bold text-2xl text-slate-50">Distributed Storage</h1>
            </Link>
            <Input.Search className="w-96 flex justify-center" placeholder="Search" size="large" />
            <Avatar size="large" icon={<UserOutlined />} />
          </Header>

          <Layout className="h-screen pt-16">
            <Sider className="bg-transparent">
              <Menu
                mode="inline"
                defaultSelectedKeys={[selectedServer]}
                defaultOpenKeys={[selectedServer]}
                className="h-full"
                onSelect={handleSelectServer}
                items={activeServers.map((server, index) => {
                  return {
                    key: server,
                    icon: <CloudServerOutlined />,
                    label: `Server ${index + 1}`,
                  };
                })}
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

              <div className="w-full my-8 flex gap-8">
                {renderedFilenames[selectedServer].map((fileName) => (
                  <Button
                    href={`http://${selectedServer}/api/download/${fileName}`}
                    target="_blank"
                    key={fileName}
                    className="flex gap-4 items-center rounded-xl w-fit px-4 py-10"
                    icon={getFileIcon(fileName)}
                    onContextMenu={(e) => console.log('Right click')}
                  >
                    <span>{fileName}</span>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleleEvent(selectedServer, fileName);
                      }}
                      danger
                    >
                      Delete
                    </Button>
                  </Button>
                ))}
              </div>
            </Content>
          </Layout>
        </Layout>
      </main>
    </>
  );
}

export async function getStaticProps() {
  await updateActiveServer();
  const activeServers = getActiveServer().map((server) => server.address);
  const fileNames = {};
  for (let server of activeServers) {
    let response = await axios.get(`http://${server}/api/read`);
    fileNames[server] = response.data || [];
  }
  return {
    props: {
      activeServers,
      fileNames,
    },
  };
}
