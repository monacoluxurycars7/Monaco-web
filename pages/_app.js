import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
  <link rel="icon" href="/LOGOREDONDO.png" type="image/png" />
  <link rel="apple-touch-icon" href="/LOGOREDONDO.png" />
</Head>
      <Component {...pageProps} />
    </>
  );
}
