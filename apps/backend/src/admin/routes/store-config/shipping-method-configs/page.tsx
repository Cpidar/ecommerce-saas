import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { FormEvent, useEffect, useState } from "react";
import { getStoreConfig, saveStoreConfig } from "../api";
import type { ShippingMethodConfigInput, StoreConfigInput } from "../types";

const emptyShippingMethodConfig: ShippingMethodConfigInput = {
  name: "",
  provider_id: "",
  medusa_shipping_option_id: "",
  provider_shipping_method_id: "",
  is_default: false,
  is_enabled: true,
  config: {},
};

const parseJson = (value: string) => {
  if (!value.trim()) {
    return {};
  }

  return JSON.parse(value);
};

const ShippingMethodConfigsPage = () => {
  const [storeConfig, setStoreConfig] = useState<StoreConfigInput | null>(null);
  const [form, setForm] = useState<ShippingMethodConfigInput>(
    emptyShippingMethodConfig,
  );
  const [configJson, setConfigJson] = useState("{}");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getStoreConfig()
      .then(setStoreConfig)
      .catch(() => toast.error("Unable to load store config"))
      .finally(() => setIsLoading(false));
  }, []);

  const editShippingMethod = (shippingMethod: ShippingMethodConfigInput) => {
    setForm(shippingMethod);
    setConfigJson(JSON.stringify(shippingMethod.config ?? {}, null, 2));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!storeConfig) {
      toast.error("Create the store config before adding shipping methods");
      return;
    }

    setIsSaving(true);

    try {
      const shippingMethodConfig = form;
      const saved = await saveStoreConfig({
        ...storeConfig,
        shipping_method_configs: {
          ...storeConfig.shipping_method_configs,
          [shippingMethodConfig.provider_id]: {
            ...storeConfig.shipping_method_configs?.[
              shippingMethodConfig.provider_id
            ],
            ...shippingMethodConfig,
          },
        },
      });

      if (saved) {
        setStoreConfig(saved);
      }

      setForm(emptyShippingMethodConfig);
      setConfigJson("{}");
      toast.success("Shipping method config saved");
    } catch (error) {
      toast.error(
        error instanceof SyntaxError
          ? "Shipping method config JSON is invalid"
          : "Unable to save shipping method config",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text>Loading shipping method configs...</Text>
      </Container>
    );
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Shipping Methods</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          Configure storefront shipping methods and provider settings.
        </Text>
      </div>

      <div className="grid gap-4 p-6">
        {(
          (storeConfig?.shipping_method_configs &&
            Object.values(storeConfig?.shipping_method_configs)) ??
          []
        ).map((shippingMethod) => (
          <button
            className="border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-base-hover grid rounded-md border p-4 text-left"
            key={
              shippingMethod.id ??
              `${shippingMethod.provider_id}-${shippingMethod.name}`
            }
            onClick={() => editShippingMethod(shippingMethod)}
            type="button"
          >
            <Text weight="plus">{shippingMethod.name}</Text>
            <Text className="text-ui-fg-subtle" size="small">
              {shippingMethod.provider_id}
            </Text>
          </button>
        ))}
      </div>

      <form className="grid gap-4 p-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="provider_id">Provider ID</Label>
            <Input
              id="provider_id"
              value={form.provider_id}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  provider_id: event.target.value,
                }))
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="medusa_shipping_option_id">
              Medusa Shipping Option ID
            </Label>
            <Input
              id="medusa_shipping_option_id"
              value={form.medusa_shipping_option_id ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  medusa_shipping_option_id: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="provider_shipping_method_id">
              Provider Shipping Method ID
            </Label>
            <Input
              id="provider_shipping_method_id"
              value={form.provider_shipping_method_id ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  provider_shipping_method_id: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <Label className="flex items-center gap-2">
            <Checkbox
              checked={Boolean(form.is_default)}
              onCheckedChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  is_default: checked === true,
                }))
              }
            />
            Default
          </Label>
          <Label className="flex items-center gap-2">
            <Checkbox
              checked={form.is_enabled !== false}
              onCheckedChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  is_enabled: checked === true,
                }))
              }
            />
            Enabled
          </Label>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="shipping_config">Config JSON</Label>
          <Textarea
            id="shipping_config"
            className="min-h-[180px] font-mono"
            value={configJson}
            onChange={(event) => setConfigJson(event.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              setForm(emptyShippingMethodConfig);
              setConfigJson("{}");
            }}
            type="button"
            variant="secondary"
          >
            Clear
          </Button>
          <Button isLoading={isSaving} type="submit">
            Save Shipping Method
          </Button>
        </div>
      </form>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Shipping Methods",
  rank: 2,
});

export const handle = {
  breadcrumb: () => "Shipping Methods",
};

export default ShippingMethodConfigsPage;
