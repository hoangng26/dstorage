import { CloudUploadOutlined, InboxOutlined } from '@ant-design/icons';
import { Button, Modal, Upload, message, notification } from 'antd';
import axios from 'axios';
import { useState } from 'react';
const { Dragger } = Upload;

export default function UploadFile({ selectedServer, activeServers, onUpdateListFiles }) {
  const [showUpload, setShowUpload] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [filesUpload, setFilesUpload] = useState([]);

  const handleUploadEvent = async () => {
    if (!filesUpload.length) {
      return;
    }

    setButtonLoading(true);

    for (let file of filesUpload) {
      if (selectedServer) {
        await UploadToSelectedServer(file);
      } else {
        await UploadToAllServer(file);
      }
    }

    notification.open({
      message: 'Upload Files',
      description: (
        <span>
          <span className="text-blue-500">
            {filesUpload.length > 1 ? `${filesUpload.length} files` : `${filesUpload[0].name}`}
          </span>{' '}
          was uploaded successfully!
        </span>
      ),
      icon: <CloudUploadOutlined className="text-blue-500" />,
    });

    onUpdateListFiles();
    setFilesUpload([]);
    setButtonLoading(false);
    setShowUpload(false);
  };

  const UploadToAllServer = async (fileUpload) => {
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
  };

  const UploadToSelectedServer = async (fileUpload) => {
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
  };

  return (
    <>
      <Button type="primary" size="large" onClick={() => setShowUpload(!showUpload)} icon={<CloudUploadOutlined />}>
        Upload Files
      </Button>

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
          if (buttonLoading) {
            return;
          }
          setFilesUpload([]);
          setShowUpload(false);
        }}
      >
        <Dragger
          name="file"
          multiple={true}
          fileList={filesUpload}
          disabled={buttonLoading}
          beforeUpload={(file) => {
            if (filesUpload.findIndex(({ fileName }) => fileName === file.fileName) >= 0) {
              message.warning('You have selected this file!');
              return false;
            }
            setFilesUpload((prevState) => [...prevState, file]);
            return false;
          }}
          onRemove={(file) => setFilesUpload((prevState) => prevState.filter((item) => item !== file))}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
          </p>
        </Dragger>
      </Modal>
    </>
  );
}
