import UploadFile from './UploadFile';

export default function FileActions({ selectedServer, activeServers, onUpdateListFiles }) {
  return (
    <>
      <div className="mt-8">
        <div className="font-bold pb-4 text-xl">{selectedServer ? `IP Address: ${selectedServer}` : 'All Servers'}</div>
      </div>

      <UploadFile selectedServer={selectedServer} activeServers={activeServers} onUpdateListFiles={onUpdateListFiles} />
    </>
  );
}
