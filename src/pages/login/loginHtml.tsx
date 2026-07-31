import type { JSX } from "react";
import { Page } from "../../components/page";
import { IAccount } from "../../models/account";
import { LoginContent } from "./loginContent";

interface IProps {
  client: Window["fetch"];
  account?: IAccount;
  redirectUrl?: string;
}

export function LoginHtml(props: IProps): JSX.Element {
  const { client, ...data } = props;

  return (
    <Page
      nowrapper={true}
      css={["login"]}
      js={["login"]}
      maxWidth={1200}
      title="Login | VMR-Lift"
      ogTitle="Login | VMR-Lift"
      canonical="http://myliftosaur.local:8081/login"
      description="The app that allows you to build weightlifting programs or pick built-in ones and track your progress"
      ogUrl="http://myliftosaur.local:8081/login"
      data={data}
      isLoggedIn={!!props.account}
      client={client}
      url={"/login"}
      redditPixel={true}
    >
      <LoginContent client={client} {...data} />
    </Page>
  );
}

