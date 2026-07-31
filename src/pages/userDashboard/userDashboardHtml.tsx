import type { JSX } from "react";
import { Page } from "../../components/page";
import { IUserDashboardData, UserDashboardContent } from "./userDashboardContent";
import { IEventPayload } from "../../api/service";

interface IProps {
  client: Window["fetch"];
  adminKey: string;
  userDao: IUserDashboardData | undefined;
  events: IEventPayload[];
  nextBefore?: number;
  hasMore: boolean;
}

export function UserDashboardHtml(props: IProps): JSX.Element {
  const { client, ...data } = props;
  const url = "http://myliftosaur.local:8081/dashboard/user";
  const title = `User Dashboard | VMR-Lift`;

  return (
    <Page
      css={["userdashboard"]}
      js={["userdashboard"]}
      maxWidth={1200}
      title={title}
      canonical={url}
      nowrapper={true}
      description=""
      ogUrl={url}
      data={data}
      client={client}
    >
      <UserDashboardContent {...data} />
    </Page>
  );
}

