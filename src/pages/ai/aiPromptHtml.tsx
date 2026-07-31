import type { JSX } from "react";
import { Page } from "../../components/page";
import { AiPromptContent } from "./aiPromptContent";
import { IAccount } from "../../models/account";

interface IAiPromptHtmlProps {
  client: Window["fetch"];
  account?: IAccount;
}

export function AiPromptHtml(props: IAiPromptHtmlProps): JSX.Element {
  const client = props.client;

  return (
    <Page
      client={client}
      css={["aiPrompt"]}
      js={["aiPrompt"]}
      maxWidth={1200}
      isLoggedIn={!!props.account}
      title="Liftoscript Prompt Generator | VMR-Lift"
      description="Generate prompts to convert workout programs to Liftoscript format using any LLM like ChatGPT, Claude, or Gemini."
      canonical="http://myliftosaur.local:8081/ai/prompt"
      ogUrl="http://myliftosaur.local:8081/ai/prompt"
      data={props}
      url="/ai/prompt"
    >
      <AiPromptContent client={client} account={props.account} />
    </Page>
  );
}

