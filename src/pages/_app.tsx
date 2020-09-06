import { AppProps } from "next/app";
import { Layout } from "@artsy/next-layout";
import { Theme } from "@artsy/palette";
import Head from "next/head";

const App = function App(props: AppProps) {
  return (
    <>
      <Head>
        <title>Team Navigator</title>
      </Head>
      <Theme>
        <Layout {...props} />
      </Theme>
    </>
  );
};

export default App;
