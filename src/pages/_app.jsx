import '@/styles/globals.css';
import { StyleProvider } from '@ant-design/cssinjs';

export default function App({ Component, pageProps }) {
  return (
    <StyleProvider hashPriority="high">
      <Component {...pageProps} />
    </StyleProvider>
  );
}
