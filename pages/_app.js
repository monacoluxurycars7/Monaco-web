import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/logo sin fondo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo sin fondo.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
