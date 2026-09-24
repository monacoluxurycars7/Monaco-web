import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
  <link rel="icon" href="/logo.png" type="image/png" />
  <link rel="apple-touch-icon" href="/logo.png" />
</Head>
      <Component {...pageProps} />
    </>
  );
}
