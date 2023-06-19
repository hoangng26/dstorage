import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import axios from 'axios';

function DownloadFiles({ listFiles }) {
  const handleDownloadEvent = async () => {
    if (!listFiles || listFiles.length === 0) {
      return;
    }

    const listServers = (
      await axios.post(
        '/api/download',
        listFiles.map((file) => file.fileName),
      )
    ).data;

    listServers.forEach((item) => {
      const server = item.server;
      item.listFiles.map((fileName) => {
        window.open(`http://${server}/api/download/${fileName}`, '_blank', 'noopener noreferrer');
      });
    });
  };

  return (
    <>
      <Button
        className="bg-green-500 hover:bg-green-400"
        type="primary"
        size="large"
        onClick={handleDownloadEvent}
        icon={<DownloadOutlined />}
      >
        Download All
      </Button>
    </>
  );
}

export default DownloadFiles;
