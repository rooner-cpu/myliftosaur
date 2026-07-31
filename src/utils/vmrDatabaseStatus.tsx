import { createContext, JSX, ReactNode, useContext } from "react";
import { IVmrAccount } from "../api/vmrAccountApi";

export type IVmrDatabaseStatus =
  | "checking"
  | "signed_out"
  | "offline"
  | "saving"
  | "ready"
  | "save_failed";

export interface IVmrDatabaseState {
  status: IVmrDatabaseStatus;
  account?: IVmrAccount;
  error?: string;
  retry: () => void;
}

const defaultState: IVmrDatabaseState = {
  status: "checking",
  retry: () => undefined,
};

const VmrDatabaseStatusContext = createContext<IVmrDatabaseState>(defaultState);

export function VmrDatabaseStatusProvider(props: {
  value: IVmrDatabaseState;
  children: ReactNode;
}): JSX.Element {
  return (
    <VmrDatabaseStatusContext.Provider value={props.value}>
      {props.children}
    </VmrDatabaseStatusContext.Provider>
  );
}

export function useVmrDatabaseStatus(): IVmrDatabaseState {
  return useContext(VmrDatabaseStatusContext);
}
