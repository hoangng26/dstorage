import { FileExcelFilled, FileFilled, FileImageFilled, FilePdfFilled, FileWordFilled } from '@ant-design/icons';

export default function FileIcon({ extension }) {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return <FileImageFilled className="text-5xl text-green-500" />;
    case 'doc':
    case 'docx':
      return <FileWordFilled className="text-5xl text-blue-500" />;
    case 'xls':
    case 'xlsx':
      return <FileExcelFilled className="text-5xl text-green-700" />;
    case 'pdf':
      return <FilePdfFilled className="text-5xl text-red-500" />;
    default:
      return <FileFilled className="text-5xl text-blue-500" />;
  }
}
