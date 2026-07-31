import type { JSX } from "react";
import { Page } from "../../components/page";
import { IUsersDashboardData, UsersDashboardContent } from "./usersDashboardContent";

export interface IUsersDashboardHtmlProps {
  usersData: IUsersDashboardData[];
  apiKey: string;
  client: Window["fetch"];
}

export function UsersDashboardHtml(props: IUsersDashboardHtmlProps): JSX.Element {
  const { client, ...data } = props;

  return (
    <Page
      css={["usersdashboard"]}
      js={["usersdashboard"]}
      maxWidth={1300}
      title="Users Dashboard | VMR-Lift"
      canonical="http://myliftosaur.local:8081/dashboards/users"
      description="The dashboard to see users' activity"
      ogUrl="http://myliftosaur.local:8081/dashboards/users"
      data={data}
      client={client}
    >
      <UsersDashboardContent client={client} {...data} />
    </Page>
  );
}

