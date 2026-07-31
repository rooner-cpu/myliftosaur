export interface ICurrentAccount {
    email: string;
}

export class AccountApi {
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

    public async logout(): Promise<void> {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Unable to sign out.");
        }
    }
}
