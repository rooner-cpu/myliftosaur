import { JSX, useState } from "react";
import { TextInput, View } from "react-native";
import { VmrAccountApi } from "../api/vmrAccountApi";
import { Button } from "./button";
import { IconSpinner } from "./icons/iconSpinner";
import { Text } from "./primitives/text";
import { IVmrDatabaseStatus, useVmrDatabaseStatus } from "../utils/vmrDatabaseStatus";

export function VmrAccountPanel(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string>();
  const api = new VmrAccountApi();
  const database = useVmrDatabaseStatus();

  async function authenticate(mode: "login" | "register"): Promise<void> {
    setError(undefined);
    setAuthenticating(true);
    try {
      if (mode === "register") {
        await api.register(email.trim(), password);
      }
      await api.login(email.trim(), password);
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed.");
      setAuthenticating(false);
    }
  }

  if (database.status === "checking" || authenticating) {
    return (
      <View className="items-center py-4" data-testid="vmr-database-checking">
        <IconSpinner width={28} height={28} />
        <Text className="mt-2 text-sm text-text-secondary">
          {authenticating ? "Signing in..." : "Checking account..."}
        </Text>
      </View>
    );
  }

  if (database.account) {
    return (
      <View className="mt-3">
        <Text className="text-sm text-text-secondary">
          Signed in as <Text className="text-sm font-bold text-text-primary">{database.account.email}</Text>
        </Text>
        <DatabaseStatus status={database.status} />
        {database.status === "save_failed" && (
          <View className="items-start mt-2">
            <Button name="vmr-database-retry" kind="purple" onClick={database.retry}>
              Retry
            </Button>
          </View>
        )}
        <View className="items-center mt-3">
          <Button
            name="vmr-account-sign-out"
            kind="purple"
            onClick={async () => {
              setAuthenticating(true);
              try {
                await api.logout();
                window.location.reload();
              } catch {
                setError("Unable to sign out.");
                setAuthenticating(false);
              }
            }}
          >
            Sign Out
          </Button>
        </View>
        {error ? <Text className="mt-2 text-sm text-text-error">{error}</Text> : null}
      </View>
    );
  }

  return (
    <View className="mt-3">
      <DatabaseStatus status={database.status} />
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        inputMode="email"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="w-full px-3 py-3 text-base border rounded border-border-neutral text-text-primary bg-background-default"
      />
      <TextInput
        autoCapitalize="none"
        autoComplete="current-password"
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        className="w-full px-3 py-3 mt-3 text-base border rounded border-border-neutral text-text-primary bg-background-default"
      />
      {error ? <Text className="mt-2 text-sm text-text-error">{error}</Text> : null}
      <View className="flex-row justify-center mt-3">
        <Button
          name="vmr-account-login"
          kind="purple"
          disabled={!email.trim() || !password}
          onClick={() => authenticate("login")}
        >
          Sign In
        </Button>
        <View className="ml-3">
          <Button
            name="vmr-account-register"
            kind="purple"
            disabled={!email.trim() || password.length < 10}
            onClick={() => authenticate("register")}
          >
            Register
          </Button>
        </View>
      </View>
    </View>
  );
}

function DatabaseStatus(props: { status: IVmrDatabaseStatus }): JSX.Element {
  const config: Record<IVmrDatabaseStatus, { label: string; className: string }> = {
    checking: { label: "Checking account...", className: "text-text-secondary" },
    signed_out: { label: "Sign in or register to continue", className: "text-text-secondary" },
    offline: { label: "The VMR-Lift server is unavailable", className: "text-text-error" },
    saving: { label: "Saving to the database...", className: "text-text-secondary" },
    ready: { label: "All changes saved", className: "text-text-success" },
    save_failed: { label: "Database save failed - retry required", className: "text-text-error" },
  };
  const current = config[props.status];
  return (
    <Text
      className={`mt-2 text-sm font-semibold ${current.className}`}
      data-testid={`vmr-database-status-${props.status}`}
    >
      {current.label}
    </Text>
  );
}

