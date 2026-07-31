export interface IVmrStoredData<T> {
  storage: T;
  revision: number;
  updatedUtc: string;
}

export class VmrStorageConflictError extends Error {
  public constructor(public readonly serverRevision?: number) {
    super("revision_conflict");
  }
}

export class VmrStorageApi<T> {
  public async get(): Promise<IVmrStoredData<T> | undefined> {
    const response = await fetch("/api/storage", {
      credentials: "include",
    });
    if (response.status === 204 || response.status === 401) {
      return undefined;
    }
    if (!response.ok) {
      throw new Error(`Storage download failed: ${response.status}`);
    }
    return response.json();
  }

  public async put(
    storage: T,
    expectedRevision: number,
    clientStorageVersion: string
  ): Promise<IVmrStoredData<T>> {
    const response = await fetch("/api/storage", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storage,
        expectedRevision,
        clientStorageVersion,
      }),
    });
    if (response.status === 409) {
      const body = await response.json().catch(() => ({}));
      throw new VmrStorageConflictError(body.serverRevision);
    }
    if (!response.ok) {
      throw new Error(`Storage upload failed: ${response.status}`);
    }
    return response.json();
  }

  public async backup(storage: T): Promise<void> {
    const response = await fetch("/api/storage/backup", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storage }),
    });
    if (!response.ok) {
      throw new Error(`Storage backup failed: ${response.status}`);
    }
  }
}
