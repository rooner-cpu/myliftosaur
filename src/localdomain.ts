import domains from "../localdomain";

const configuredDomains = domains as typeof domains & { metroPort?: number };

export const localdomain: string = configuredDomains.main;
export const localapidomain: string = configuredDomains.api;
export const localstreamingapidomain: string = configuredDomains.streamingapi;
export const localport: number = configuredDomains.port || 8080;
export const localapiport: number = configuredDomains.apiPort || 3000;
export const localstreamingapiport: number = configuredDomains.streamingApiPort || 3001;
export const localmetroport: number = configuredDomains.metroPort || 8081;
