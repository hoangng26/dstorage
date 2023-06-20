import { CheckCircleTwoTone, CloseCircleOutlined, CloseSquareTwoTone } from '@ant-design/icons';
import { Button } from 'antd';
import DeleteFiles from './DeleteFiles';
import DownloadFiles from './DownloadFiles';
import UploadFile from './UploadFile';

export default function FileActions({
  selectedServer,
  listFiles,
  selectedFiles,
  activeServers,
  onUpdateListFiles,
  onUpdateSelectedFiles,
}) {
  return (
    <>
      <div className="mt-8">
        <div className="font-bold text-xl">{selectedServer ? `IP Address: ${selectedServer}` : 'All Servers'}</div>
        <div className="font-bold pb-4 text-xl">
          <span>
            Active:{' '}
            {selectedServer &&
              (activeServers.includes(selectedServer) ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseSquareTwoTone twoToneColor="red" />
              ))}
            {!selectedServer && <CheckCircleTwoTone twoToneColor="#52c41a" />}{' '}
          </span>
        </div>
      </div>

      {listFiles.length > 0 && (
        <div className="flex gap-4">
          <UploadFile
            selectedServer={selectedServer}
            activeServers={activeServers}
            onUpdateListFiles={onUpdateListFiles}
          />
          {Boolean(selectedFiles.length) && (
            <div className="flex gap-4">
              <DownloadFiles listFiles={selectedFiles} />

              <DeleteFiles
                listFiles={selectedFiles}
                onUpdateListFiles={onUpdateListFiles}
                onUpdateSelectedFiles={onUpdateSelectedFiles}
              />

              <Button
                type="primary"
                size="large"
                icon={<CloseCircleOutlined />}
                onClick={() => onUpdateSelectedFiles('', '', true, true)}
              >
                Deselect All
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
