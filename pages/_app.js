import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/fondo admin.png" type="image/png" />
        <link rel="apple-touch-icon" href="/fondo admin.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
