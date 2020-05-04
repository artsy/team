import { AppProps } from "next/app";
import { Layout } from "@artsy/next-layout";
import { Theme } from "@artsy/palette";

export default function App(props: AppProps) {
  return (
    <Theme>
      <Layout {...props} />
    </Theme>
  );
}
