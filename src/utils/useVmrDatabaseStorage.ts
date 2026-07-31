import { useCallback, useEffect, useRef, useState } from "react";
import { IVmrAccount, VmrAccountApi } from "../api/vmrAccountApi";
import { VmrStorageApi, VmrStorageConflictError } from "../api/vmrStorageApi";
import { IDispatch } from "../ducks/types";
import { IState } from "../models/state";
import { Storage_get, Storage_getDefault } from "../models/storage";
import { IStorage } from "../types";
import { IVmrDatabaseState } from "./vmrDatabaseStatus";

const retryDelayMs = 15000;
const saveDebounceMs = 2000;

export function useVmrDatabaseStorage(state: IState, dispatch: IDispatch): IVmrDatabaseState {
  const stateRef = useRef(state);
  const accountRef = useRef<IVmrAccount | undefined>(undefined);
  const revisionRef = useRef(0);
  const readyRef = useRef(false);
  const saveTimerRef = useRef<number | undefined>(undefined);
  const lastSavedJsonRef = useRef<string | undefined>(undefined);
  const storageApiRef = useRef(new VmrStorageApi<IStorage>());
  const [retryGeneration, setRetryGeneration] = useState(0);
  const [databaseState, setDatabaseState] = useState<Omit<IVmrDatabaseState, "retry">>({
    status: "checking",
  });
  const retry = useCallback(() => setRetryGeneration((value) => value + 1), []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  function installStorage(account: IVmrAccount, storage: IStorage, revision: number): void {
    lastSavedJsonRef.current = JSON.stringify(storage);
    revisionRef.current = revision;
    dispatch({
      type: "ReplaceState",
      state: {
        ...stateRef.current,
        storage,
        lastSyncedStorage: storage,
        user: { id: account.id, email: account.email },
      },
    });
  }

  async function loadAuthoritativeStorage(account: IVmrAccount): Promise<void> {
    const saved = await storageApiRef.current.get();
    if (saved == null) {
      const initialStorage = {
        ...Storage_getDefault(),
        tempUserId: account.id,
        email: account.email,
      };
      const created = await storageApiRef.current.put(
        initialStorage,
        0,
        String(initialStorage.version)
      );
      installStorage(account, initialStorage, created.revision);
      return;
    }

    const validated = Storage_get(saved.storage, true);
    if (!validated.success) {
      throw new Error("The database contains invalid VMR-Lift storage.");
    }
    installStorage(account, validated.data, saved.revision);
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize(): Promise<void> {
      readyRef.current = false;
      accountRef.current = undefined;
      setDatabaseState({ status: "checking" });

      try {
        const account = await new VmrAccountApi().getCurrent();
        if (cancelled) {
          return;
        }
        if (account == null) {
          setDatabaseState({ status: "signed_out" });
          return;
        }

        accountRef.current = account;
        setDatabaseState({ status: "saving", account });
        await loadAuthoritativeStorage(account);
        if (cancelled) {
          return;
        }
        readyRef.current = true;
        setDatabaseState({ status: "ready", account });
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : "Database connection failed.";
        setDatabaseState({
          status: accountRef.current ? "save_failed" : "offline",
          account: accountRef.current,
          error: message,
        });
      }
    }

    initialize();
    return () => {
      cancelled = true;
      readyRef.current = false;
      if (saveTimerRef.current != null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [dispatch, retryGeneration]);

  useEffect(() => {
    const account = accountRef.current;
    if (!readyRef.current || account == null) {
      return;
    }

    const storageJson = JSON.stringify(state.storage);
    if (storageJson === lastSavedJsonRef.current) {
      return;
    }

    if (saveTimerRef.current != null) {
      window.clearTimeout(saveTimerRef.current);
    }

    const save = async (): Promise<void> => {
      const currentAccount = accountRef.current;
      if (!readyRef.current || currentAccount == null) {
        return;
      }

      const latestStorage = stateRef.current.storage;
      try {
        setDatabaseState({ status: "saving", account: currentAccount });
        const saved = await storageApiRef.current.put(
          latestStorage,
          revisionRef.current,
          String(latestStorage.version)
        );
        revisionRef.current = saved.revision;
        lastSavedJsonRef.current = JSON.stringify(latestStorage);
        setDatabaseState({ status: "ready", account: currentAccount });
      } catch (error) {
        if (error instanceof VmrStorageConflictError) {
          readyRef.current = false;
          try {
            await loadAuthoritativeStorage(currentAccount);
            readyRef.current = true;
            setDatabaseState({ status: "ready", account: currentAccount });
          } catch (reloadError) {
            setDatabaseState({
              status: "save_failed",
              account: currentAccount,
              error: reloadError instanceof Error ? reloadError.message : "Database reload failed.",
            });
          }
          return;
        }

        setDatabaseState({
          status: "save_failed",
          account: currentAccount,
          error: error instanceof Error ? error.message : "Database save failed.",
        });
        saveTimerRef.current = window.setTimeout(save, retryDelayMs);
      }
    };

    saveTimerRef.current = window.setTimeout(save, saveDebounceMs);
    return () => {
      if (saveTimerRef.current != null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [state.storage]);

  return {
    ...databaseState,
    retry,
  };
}
