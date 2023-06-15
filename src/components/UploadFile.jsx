import { CloudUploadOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import axios from 'axios';
import { useRef, useState } from 'react';

export default function UploadFile({ activeServers, onUpdateListFiles }) {
  const [showUpload, setShowUpload] = useState(false);
  const [fileUpload, setFileUpload] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const formRef = useRef();

  const handleUploadEvent = async () => {
    if (!fileUpload) {
      return;
    }
    setButtonLoading(true);
    const listUploadServers = (await axios.get('/api/get-upload-servers')).data;
    const data = new FormData();
    data.append('file', fileUpload);

    await Promise.all(
      listUploadServers.map(async (selectedServer) => {
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
      }),
    );

    onUpdateListFiles();
    formRef.current.reset();
    setFileUpload(null);
    setButtonLoading(false);
    setShowUpload(false);
  };

  return (
    <>
      <div className="mt-8">
        <div className="font-bold pb-4 text-xl">All Servers</div>
        <Button type="primary" size="large" onClick={() => setShowUpload(!showUpload)} icon={<CloudUploadOutlined />}>
          Upload file
        </Button>
      </div>

      <Modal
        title="Upload File"
        open={showUpload}
        okText="Upload"
        okButtonProps={{
          icon: <CloudUploadOutlined />,
          loading: buttonLoading,
        }}
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
    </>
  );
}
