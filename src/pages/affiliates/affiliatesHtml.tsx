import type { JSX } from "react";
import { Page } from "../../components/page";
import { IAccount } from "../../models/account";
import { AffiliatesContent } from "./affiliatesContent";

export interface IAffiliatesHtmlProps {
  client: Window["fetch"];
  account?: IAccount;
}

export function AffiliatesHtml(props: IAffiliatesHtmlProps): JSX.Element {
  const { client, ...data } = props;

  return (
    <Page
      isLoggedIn={!!props.account}
      css={["affiliates"]}
      js={["affiliates"]}
      maxWidth={1200}
      title="Affiliate Program | VMR-Lift"
      ogTitle="Affiliate Program | VMR-Lift"
      canonical="http://myliftosaur.local:8081/affiliates"
      description="VMR-Lift's affiliate program - earn money by referring paid users to VMR-Lift"
      ogUrl="http://myliftosaur.local:8081/affiliates"
      data={data}
      client={client}
    >
      <AffiliatesContent client={client} {...data} />
    </Page>
  );
}

