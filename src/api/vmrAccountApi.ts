export interface IVmrAccount {
  id: string;
  email: string;
}

export class VmrAccountApi {
  public async getCurrent(): Promise<IVmrAccount | undefined> {
    const response = await fetch("/api/account/me", {
      credentials: "include",
    });
    if (response.status === 401) {
      return undefined;
    }
    if (!response.ok) {
      throw new Error(`Account request failed: ${response.status}`);
    }
    return response.json();
  }

  public async register(email: string, password: string): Promise<void> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
  }

  public async login(email: string, password: string): Promise<void> {
    const response = await fetch("/api/auth/login?useCookies=true", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error("Invalid email or password.");
    }
  }

  public async devLogin(userId: string): Promise<void> {
    const response = await fetch("/api/account/dev-login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error("Development passwordless login is not enabled.");
    }
  }

  public async logout(): Promise<void> {
    const response = await fetch("/api/account/logout", {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Unable to sign out.");
    }
  }
}
