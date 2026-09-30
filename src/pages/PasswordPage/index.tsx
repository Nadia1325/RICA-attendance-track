// src/pages/PasswordPage/index.tsx
import { useState } from "react";
import { Card, PageHeader } from "../../components/ui";
import { useApp } from "../../data/store";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { UserProfileHeader } from "./UserProfileHeader";

export function PasswordPage() {
  const { currentUser, changeOwnPassword } = useApp();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handlePasswordChange(
    currentPass: string,
    newPass: string
  ): Promise<void> {
    setBusy(true);
    try {
      await changeOwnPassword(currentPass, newPass);
      setMessage("Password changed successfully.");
    } catch (cause) {
      const errMsg =
        cause instanceof Error ? cause.message : "Unable to change your password.";
      setError(errMsg);
      throw cause; // Propagate to sub-component to retain form state on error
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader
        title="Change password"
        subtitle="Update the password for your RICA account."
      />

      <Card className="max-w-xl p-6">
        <UserProfileHeader userName={currentUser?.name} />
        <PasswordChangeForm
          onSubmit={handlePasswordChange}
          busy={busy}
          error={error}
          message={message}
          setError={setError}
          setMessage={setMessage}
        />
      </Card>
    </div>
  );
}

export default PasswordPage;