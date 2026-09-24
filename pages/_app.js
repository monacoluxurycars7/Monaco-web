import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/BARRA.png" type="image/png" />
        <link rel="apple-touch-icon" href="/BARRA.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
