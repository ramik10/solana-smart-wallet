import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app";
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
        <Component {...pageProps} />
      <ToastContainer />
    </SessionProvider>
  )
}
