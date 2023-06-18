import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';

function DownloadFiles({ listFiles }) {
  const handleDownloadEvent = async () => {
    console.log(...listFiles);
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
