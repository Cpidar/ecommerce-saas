import { useState } from "react";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Button, Container, Heading, Select, Text, Badge } from "@medusajs/ui";

const ACCOUNTING_PROVIDERS = [
  { value: "pishro", label: "پیشرو" },
  // { value: "hesabfa", label: "حسابفا" },
  // { value: "holoo", label: "هلو" },
  // { value: "sepidar", label: "sepidar" },
  // { value: "mahak", label: "mahak" },
  // { value: "parsian", label: "parsian" },
  // { value: "dasht", label: "dasht" },
];

const AccountingSyncWidget = () => {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string>("pishro");
  const [pendingSync, setPendingSync] = useState<{
    transactionId?: string;
    summary: {
      provider: string;
      total: number;
      matched: number;
      unmatched: string[];
      itemUpdates: number;
      unchangedItems: number;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = async () => {
    setLoading(true);
    setError(null);
    setPendingSync(null);

    try {
      const response = await fetch("/admin/accounting/sync", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          options: {
            apiUrl: "https://api.core.pishroacc.com",
            username: "011931",
            appcode: "011931",
            password: "197967957424",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Synchronization failed");
      }

      setPendingSync(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!pendingSync) return;
    await fetch(`/admin/accounting/sync/${pendingSync.transactionId}/confirm`, {
      method: "POST",
      credentials: "include",
    });

    setPendingSync(null);
  };
  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Heading level="h2">Accounting Sync</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Synchronize product prices and inventory quantities with your
            accounting system.
          </Text>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-x-3">
          <Select value={provider} onValueChange={setProvider}>
            <Select.Trigger className="w-full sm:w-[180px]">
              <Select.Value placeholder="Select provider" />
            </Select.Trigger>
            <Select.Content>
              {ACCOUNTING_PROVIDERS.map((item) => (
                <Select.Item key={item.value} value={item.value}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <Button
            variant="secondary"
            onClick={sync}
            disabled={loading || !provider}
            isLoading={loading}
          >
            {loading ? "Syncing..." : "Sync Products"}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-ui-bg-subtle px-6 py-4">
          <div className="flex items-start gap-x-2">
            <Badge color="red" size="2xsmall" className="mt-0.5">
              Error
            </Badge>
            <Text size="small" className="text-ui-fg-error">
              {error}
            </Text>
          </div>
        </div>
      )}

      {/* Results */}
      {pendingSync && (
        <div className="px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              Last sync results
            </Text>
            <Badge color="green" size="2xsmall">
              Completed
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Total Products will be synced
              </Text>
              <Text size="large" weight="plus" className="mt-1">
                {pendingSync?.summary.total ?? 0}
              </Text>
            </div>

            <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Products will be Updated
              </Text>
              <Text size="large" weight="plus" className="mt-1">
                {pendingSync.summary.itemUpdates ?? 0}
              </Text>
            </div>

            <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Products that will be unchanged
              </Text>
              <Text size="large" weight="plus" className="mt-1">
                {pendingSync.summary.unchangedItems ?? 0}
              </Text>
            </div>
          </div>

          {!!pendingSync.summary.unmatched?.length && (
            <div className="mt-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
              <div className="mb-2 flex items-center gap-x-2">
                <Text size="xsmall" className="text-ui-fg-subtle">
                  Unmatched SKUs
                </Text>
                <Badge color="orange" size="2xsmall">
                  {pendingSync.summary.unmatched.length}
                </Badge>
              </div>
              <Text size="small" className="break-all text-ui-fg-base">
                {pendingSync.summary.unmatched.join(", ")}
              </Text>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="primary" onClick={confirm}>
              Confirm Sync
            </Button>

            <Button variant="secondary" onClick={() => setPendingSync(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.list", // adjust zone as needed
});

export default AccountingSyncWidget;
