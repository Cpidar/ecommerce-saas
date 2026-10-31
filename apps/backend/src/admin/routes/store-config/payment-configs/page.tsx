"use client";

import {
  CreditCard,
  CurrencyDollar,
  FloppyDisk,
  Loader,
} from "@medusajs/icons";
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Input,
  Label,
  Text,
  Heading,
  Switch,
  toast,
} from "@medusajs/ui";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoreConfig, saveStoreConfig } from "../api";
import type { StoreConfigInput, PaymentConfigInput } from "../types";
import { StoreConfigShell } from "../store-config-layout";

type ProviderConfig = {
  name: string;
  logo: string;
  fields: string[];
  placeholders?: Record<string, string>;
};

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  pp_behpardakht: {
    name: "به پرداخت",
    logo: "https://my.behpardakht.com/logo.png",
    fields: ["terminalId", "username", "password"],
    placeholders: {
      terminalId: "ترمینال آیدی",
      username: "نام کاربری",
      password: "رمز عبور",
      // wsdlUrl: "آدرس WSDL",
      // gatewayUrl: "آدرس Gateway",
    },
  },
  pp_zarinpal: {
    name: "زرین پال",
    logo: "https://www.zarinpal.com/favicon.ico",
    fields: ["merchantId"],
    placeholders: { merchantId: "مرچنت آیدی" },
  },
  pp_saman: {
    name: "سامان",
    logo: "https://www.sep.ir/favicon.ico",
    fields: ["terminalId", "password"],
    placeholders: { terminalId: "ترمینال آیدی", password: "رمز عبور" },
  },
  pp_parsian: {
    name: "پارسیان",
    logo: "https://pec.ir/uploads/assets/images/pec-fav-icon.png",
    fields: ["terminalId", "username", "password"],
    placeholders: {
      terminalId: "ترمینال آیدی",
      username: "نام کاربری",
      password: "رمز عبور",
    },
  },
  pp_nextpay: {
    name: "نکست پی",
    logo: "https://nextpay.ir/favicon.ico",
    fields: ["apiKey"],
    placeholders: { apiKey: "کلید API" },
  },
};

const SUPPORTED_PAYMENT_PROVIDERS = Object.keys(PROVIDER_CONFIGS);

const emptyPaymentConfig = (providerId: string): PaymentConfigInput => ({
  name: PROVIDER_CONFIGS[providerId]?.name ?? providerId,
  provider_id: providerId,
  provider_store_id: "",
  is_default: false,
  is_enabled: false,
  config: {},
  logo: PROVIDER_CONFIGS[providerId]?.logo
});

const isConfigComplete = (method: PaymentConfigInput): boolean => {
  const provider = PROVIDER_CONFIGS[method.provider_id];
  if (!provider) return false;

  const config = method.config ?? {};
  return provider.fields.every((field) => {
    const value = config[field];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });
};

const upsertPaymentConfig = (
  storeConfig: StoreConfigInput,
  paymentConfig: PaymentConfigInput,
): StoreConfigInput => ({
  ...storeConfig,
  payment_configs: {
    ...storeConfig.payment_configs,
    [paymentConfig.provider_id]: {
      ...storeConfig.payment_configs?.[paymentConfig.provider_id],
      ...paymentConfig,
    },
  },
});

const FormField = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`grid gap-2 ${className}`}>
    <Label>{label}</Label>
    {children}
  </div>
);

const PaymentMethods = () => {
  const queryClient = useQueryClient();
  const [localConfigs, setLocalConfigs] = useState<
    Record<string, PaymentConfigInput>
  >({});

  const {
    data: storeConfig,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payment_methods"],
    queryFn: getStoreConfig,
  });

  const saveMutation = useMutation({
    mutationFn: saveStoreConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods"] });
      toast.success("تنظیمات درگاه ذخیره شد");
    },
    onError: () => {
      toast.error("خطا در ذخیره تنظیمات");
    },
  });

  const methods = useMemo(() => {
    return SUPPORTED_PAYMENT_PROVIDERS.map((providerId) => {
      const existing = storeConfig?.payment_configs?.[providerId];
      const local = localConfigs[providerId];
      return local ?? existing ?? emptyPaymentConfig(providerId);
    });
  }, [storeConfig?.payment_configs, localConfigs]);

  const updateLocal = (providerId: string, updates: Partial<PaymentConfigInput>) => {
    setLocalConfigs((prev) => {
      const current =
        prev[providerId] ??
        storeConfig?.payment_configs?.[providerId] ??
        emptyPaymentConfig(providerId);

      return {
        ...prev,
        [providerId]: {
          ...current,
          ...updates,
          config: {
            ...(current.config ?? {}),
            ...(updates.config ?? {}),
          },
        },
      };
    });
  };

  const handleConfigChange = (providerId: string, key: string, value: string) => {
    updateLocal(providerId, {
      config: { [key]: value },
    });
  };

  const handleToggle = (method: PaymentConfigInput, enabled: boolean) => {
    if (enabled && !isConfigComplete(method)) {
      toast.error("لطفا ابتدا تمام فیلدهای مورد نیاز را پر کنید");
      return;
    }
    updateLocal(method.provider_id, { is_enabled: enabled });
  };

  const handleSave = (method: PaymentConfigInput) => {
    if (!storeConfig) return;

    const payload = {
      ...method,
      name: PROVIDER_CONFIGS[method.provider_id]?.name || method.name,
    };

    saveMutation.mutate(upsertPaymentConfig(storeConfig, payload), {
      onSuccess: () => {
        // clear local override after successful save
        setLocalConfigs((prev) => {
          const { [method.provider_id]: _, ...rest } = prev;
          return rest;
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader className="size-8" />
      </div>
    );
  }

  if (isError || !storeConfig) {
    return (
      <Container className="flex flex-col items-center justify-center py-12">
        <Heading level="h2">خطا در دریافت تنظیمات پرداخت</Heading>
        <Text className="mt-2 text-ui-fg-subtle">
          لطفا صفحه را دوباره بارگذاری کنید
        </Text>
      </Container>
    );
  }

  return (
    <StoreConfigShell>
      <div className="space-y-3">
        {/*<div>
          <Heading>روش‌های پرداخت</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            مدیریت درگاه‌های پرداخت ایرانی
          </Text>
        </div>*/}

        {methods.map((method) => {
          const provider = PROVIDER_CONFIGS[method.provider_id];
          const complete = isConfigComplete(method);

          return (
            <Container key={method.provider_id} className="p-6">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between border-b border-ui-border-base pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center">
                    {provider?.logo ? (
                      <img
                        src={provider.logo}
                        alt={provider.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <CreditCard className="size-6 text-ui-fg-muted" />
                    )}
                  </div>
                  <div>
                    <Heading level="h2">{provider?.name || method.name}</Heading>
                    {/*<Text size="small" className="text-ui-fg-subtle">
                      {method.provider_id}
                    </Text>*/}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Text size="small" className="text-ui-fg-subtle">
                    {method.is_enabled ? "فعال" : "غیرفعال"}
                  </Text>
                  <Switch
                    checked={!!method.is_enabled}
                    onCheckedChange={(checked) =>
                      handleToggle(method, !!checked)
                    }
                    disabled={!complete && !method.is_enabled}
                  />
                </div>
              </div>

              {/* Always visible config fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {provider?.fields.map((field) => (
                  <FormField
                    key={field}
                    label={provider.placeholders?.[field] || field}
                  >
                    <Input
                      type={
                        field.toLowerCase().includes("password")
                          ? "password"
                          : "text"
                      }
                      value={String(method.config?.[field] ?? "")}
                      onChange={(e) =>
                        handleConfigChange(
                          method.provider_id,
                          field,
                          e.target.value,
                        )
                      }
                      placeholder={provider.placeholders?.[field]}
                    />
                  </FormField>
                ))}
              </div>

              {/* Save button */}
              <div className="mt-6 flex justify-end">
                <Button
                  size="small"
                  onClick={() => handleSave(method)}
                  isLoading={saveMutation.isPending}
                >
                  <FloppyDisk className="mr-2" />
                  ذخیره
                </Button>
              </div>
            </Container>
          );
        })}
      </div>
    </StoreConfigShell>
  );
};

export const config = defineRouteConfig({
  label: "روش‌های پرداخت",
  icon: CurrencyDollar,
  rank: 4,
});

export default PaymentMethods;
