import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/barra.jpeg" type="image/png" />
        <link rel="apple-touch-icon" href="/barra.jpeg" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
