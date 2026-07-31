import type { JSX } from "react";
import { IRecordResponse } from "../../api/service";
import { RecordContent } from "./recordContent";
import { Page } from "../../components/page";

export function RecordHtml({
  data,
  userId,
  recordId,
  client,
}: {
  data: IRecordResponse;
  userId: string;
  recordId: number;
  client: Window["fetch"];
}): JSX.Element {
  const url = `http://myliftosaur.local:8081/record?user=${userId}&id=${recordId}`;
  return (
    <Page
      css={["main", "record"]}
      js={["record"]}
      title="Workout summary | VMR-Lift"
      description="Workout summary - what exercises were done, with what sets, reps, weights, new personal records."
      canonical={url}
      ogUrl={url}
      ogImage={`http://myliftosaur.local:8081/recordimage?user=${userId}&id=${recordId}`}
      data={data}
      client={client}
    >
      <RecordContent data={data} />
    </Page>
  );
}

