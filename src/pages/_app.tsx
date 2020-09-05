import { AppProps } from "next/app";
import { Layout } from "@artsy/next-layout";
import { Theme, unitlessBreakpoints as breakpoints } from "@artsy/palette";
import Head from "next/head";
import { useEffect } from "react";
import GridLayout from "atomic-layout";

const App = function App(props: AppProps) {
  useEffect(() => {
    GridLayout.configure({
      breakpoints: {
        xl: {
          minWidth: breakpoints.xl,
        },
        lg: {
          minWidth: breakpoints.lg,
          maxWidth: breakpoints.xl - 1,
        },
        md: {
          minWidth: breakpoints.md,
          maxWidth: breakpoints.lg - 1,
        },
        sm: {
          minWidth: breakpoints.sm,
          maxWidth: breakpoints.md - 1,
        },
        xs: {
          maxWidth: breakpoints.xs,
        },
      },
    });
  });
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
