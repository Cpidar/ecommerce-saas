"use client";

import {
  CreditCard,
  EllipsisVertical,
  Pencil,
  Plus,
  FloppyDisk,
  Trash,
  XMark,
  CurrencyDollar,
  Loader,
} from "@medusajs/icons";
import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  Container,
  DropdownMenu,
  Input,
  Label,
  Select,
  Text,
  Heading,
  toast,
} from "@medusajs/ui";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk";
import { getStoreConfig, saveStoreConfig } from "../api";
import type { StoreConfigInput, PaymentConfigInput } from "../types";

type ProviderConfig = {
  name: string;
  logo: string;
  fields: string[];
  placeholders?: Record<string, string>;
};

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  pp_behpardakht_behpardakht: {
    name: "به پرداخت",
    logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/ecommerce/payment-methods/paypal.svg",
    fields: ["terminalId", "username", "password", "wsdlUrl", "gatewayUrl"],
    placeholders: {
      terminalId: "ترمینال آیدی",
      username: "نام کاربری",
      password: "رمز عبور",
      wsdlUrl: "آدرس WSDL",
      gatewayUrl: "آدرس Gateway",
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
    logo: "https://www.pec.ir/favicon.ico",
    fields: ["terminalId", "username", "password"],
    placeholders: {
      terminalId: "ترمینال آیدی",
      username: "نام کاربری",
      password: "رمز عبور",
    },
  },
  pp_mellat: {
    name: "ملت",
    logo: "https://www.bpi.ir/favicon.ico",
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

const emptyPaymentConfig: PaymentConfigInput = {
  name: "",
  provider_id: "",
  provider_store_id: "",
  is_default: false,
  is_enabled: true,
  config: {},
};

interface PaymentMethodsProps {
  className?: string;
}

const getPaymentConfigKey = (paymentConfig: PaymentConfigInput) =>
  paymentConfig.provider_id;

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

// const deletePaymentConfig = (
//   storeConfig: StoreConfigInput,
//   providerId: string,
// ): StoreConfigInput => {
//   const { [providerId]: _deleted, ...remainingPaymentConfigs } =
//     storeConfig.payment_configs ?? {};

//   return {
//     ...storeConfig,
//     payment_configs: remainingPaymentConfigs,
//   };
// };

const PaymentMethods = ({ className }: PaymentMethodsProps) => {
  const queryClient = useQueryClient();
  const [editingProviderId, setEditingProviderId] = useState<string | null>(
    null,
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editForm, setEditForm] =
    useState<PaymentConfigInput>(emptyPaymentConfig);

  const { data: medusaPaymentProviderIds = [] } = useQuery({
    queryKey: ["payment_providers"],
    queryFn: async () => {
      const { payment_providers } =
        await sdk.admin.payment.listPaymentProviders();

      return payment_providers.filter((pp) => pp.is_enabled).map((pp) => pp.id);
    },
  });

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
    },
    onError: (error) => {
      toast.error(
        error instanceof SyntaxError
          ? "Payment config JSON is invalid"
          : "Unable to save payment config",
      );
    },
  });

  const methods = useMemo(
    () => Object.values(storeConfig?.payment_configs ?? {}),
    [storeConfig?.payment_configs],
  );

  const missingProviderIds = useMemo(() => {
    const activeProviderIds = new Set(
      Object.keys(storeConfig?.payment_configs ?? {}).filter(
        // filter of lefted old key that remains in payment config object, refer to deleteMethod
        (p) => storeConfig?.payment_configs?.[p],
      ),
    );

    return medusaPaymentProviderIds.filter(
      (providerId) => !activeProviderIds.has(providerId),
    );
  }, [medusaPaymentProviderIds, storeConfig?.payment_configs]);

  const currentProvider = editForm.provider_id
    ? PROVIDER_CONFIGS[editForm.provider_id]
    : null;

  const startEditing = (method: PaymentConfigInput) => {
    setIsAddingNew(false);
    setEditingProviderId(method.provider_id);
    setEditForm({ ...method, config: { ...(method.config ?? {}) } });
  };

  const cancelEditing = () => {
    setEditingProviderId(null);
    setEditForm(emptyPaymentConfig);
  };

  const startAddingNew = () => {
    const providerId = missingProviderIds[0];

    if (!providerId) {
      return;
    }

    setEditingProviderId(null);
    setIsAddingNew(true);
    setEditForm({
      ...emptyPaymentConfig,
      provider_id: providerId,
      name: PROVIDER_CONFIGS[providerId]?.name ?? providerId,
      is_default: methods.length === 0,
    });
  };

  const cancelAddingNew = () => {
    setIsAddingNew(false);
    setEditForm(emptyPaymentConfig);
  };

  const save = () => {
    if (!storeConfig || !editForm.provider_id) {
      return;
    }

    const providerName =
      PROVIDER_CONFIGS[editForm.provider_id]?.name || editForm.name;
    const paymentConfig = {
      ...editForm,
      name: providerName,
    };

    saveMutation.mutate(upsertPaymentConfig(storeConfig, paymentConfig), {
      onSuccess: () => {
        setEditingProviderId(null);
        setIsAddingNew(false);
        setEditForm(emptyPaymentConfig);
        toast.success("Payment config saved");
      },
    });
  };

  const deleteMethod = (providerId: string) => {
    if (!storeConfig) return;

    const { [providerId]: _deleted, ...payment_configs } =
      storeConfig.payment_configs ?? {};

    saveMutation.mutate(
      {
        ...storeConfig,
        payment_configs,
      },
      {
        onSuccess: () => {
          setEditingProviderId(null);
          setIsAddingNew(false);
          setEditForm(emptyPaymentConfig);
          toast.success("Payment config deleted");
        },
      },
    );
  };

  const handleProviderChange = (providerId: string) => {
    setEditForm((prev) => ({
      ...prev,
      provider_id: providerId,
      name: PROVIDER_CONFIGS[providerId]?.name ?? providerId,
      config: {},
    }));
  };

  const handleConfigChange = (key: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      config: { ...(prev.config ?? {}), [key]: value },
    }));
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
    <section className={className}>
      <div className="mx-auto max-w-2xl py-16 md:py-24">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Heading>روش‌های پرداخت</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              مدیریت درگاه‌های پرداخت ایرانی
            </Text>
          </div>
          <Button
            onClick={startAddingNew}
            disabled={
              saveMutation.isPending ||
              isAddingNew ||
              missingProviderIds.length === 0
            }
          >
            <Plus className="mr-2" />
            افزودن درگاه جدید
          </Button>
        </div>

        <div className="space-y-3">
          {methods
            .filter((method) => method)
            .map((method) => {
              const providerId = getPaymentConfigKey(method);
              const isEditing = editingProviderId === providerId;

              return (
                <Container
                  key={providerId}
                  className={`overflow-hidden border p-0 transition-colors ${
                    isEditing
                      ? "border-ui-border-interactive"
                      : "border-ui-border-base"
                  }`}
                >
                  <div className="p-4">
                    {isEditing ? (
                      <EditForm
                        editForm={editForm}
                        currentProvider={currentProvider}
                        onProviderChange={handleProviderChange}
                        onConfigChange={handleConfigChange}
                        onSave={save}
                        onCancel={cancelEditing}
                        isSaving={saveMutation.isPending}
                      />
                    ) : (
                      <ViewMode
                        method={method}
                        onEdit={() => startEditing(method)}
                        onDelete={() => deleteMethod(method.provider_id)}
                        isDeleting={saveMutation.isPending}
                      />
                    )}
                  </div>
                </Container>
              );
            })}

          {isAddingNew && (
            <Container className="border-ui-border-interactive overflow-hidden p-0">
              <div className="p-4">
                <EditForm
                  editForm={editForm}
                  availableProviderIds={missingProviderIds}
                  currentProvider={currentProvider}
                  onProviderChange={handleProviderChange}
                  onConfigChange={handleConfigChange}
                  onSave={save}
                  onCancel={cancelAddingNew}
                  isSaving={saveMutation.isPending}
                  isNew
                />
              </div>
            </Container>
          )}
        </div>

        {methods.filter((m) => m).length === 0 && !isAddingNew && (
          <Container className="mt-3 flex flex-col items-center justify-center py-12">
            <CreditCard className="mb-4 size-12 text-ui-fg-muted" />
            <Heading level="h2">هیچ درگاهی ثبت نشده است</Heading>
            <Text className="mt-2 text-ui-fg-subtle">
              درگاه پرداخت اضافه کنید
            </Text>
            <Button
              className="mt-4"
              onClick={startAddingNew}
              disabled={missingProviderIds.length === 0}
            >
              <Plus className="mr-2" />
              افزودن درگاه پرداخت
            </Button>
          </Container>
        )}
      </div>
    </section>
  );
};

type EditFormProps = {
  editForm: PaymentConfigInput;
  availableProviderIds?: string[];
  currentProvider: ProviderConfig | null;
  onProviderChange: (providerId: string) => void;
  onConfigChange: (key: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isNew?: boolean;
};

const EditForm = ({
  editForm,
  availableProviderIds,
  currentProvider,
  onProviderChange,
  onConfigChange,
  onSave,
  onCancel,
  isSaving,
  isNew = false,
}: EditFormProps) => {
  const providerIds = availableProviderIds ?? [editForm.provider_id];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {isNew ? "افزودن درگاه جدید" : "ویرایش درگاه"}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="small"
            onClick={onCancel}
            disabled={isSaving}
          >
            <XMark />
          </Button>
          <Button
            size="small"
            onClick={onSave}
            disabled={isSaving || !editForm.provider_id}
          >
            {isSaving ? (
              <Loader className="size-4" />
            ) : (
              <FloppyDisk className="mr-2" />
            )}
            ذخیره
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>درگاه پرداخت</Label>
          <Select
            value={editForm.provider_id}
            onValueChange={onProviderChange}
            disabled={!isNew}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {providerIds.map((providerId) => (
                <Select.Item key={providerId} value={providerId}>
                  {PROVIDER_CONFIGS[providerId]?.name ?? providerId}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        {currentProvider?.fields.map((field) => (
          <div key={field} className="space-y-2">
            <Label>{currentProvider.placeholders?.[field] || field}</Label>
            <Input
              type={
                field.toLowerCase().includes("password") ? "password" : "text"
              }
              value={String(editForm.config?.[field] ?? "")}
              onChange={(event) => onConfigChange(field, event.target.value)}
              placeholder={currentProvider.placeholders?.[field]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

type ViewModeProps = {
  method: PaymentConfigInput;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

const ViewMode = ({ method, onEdit, onDelete, isDeleting }: ViewModeProps) => {
  const provider = PROVIDER_CONFIGS[method.provider_id];

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-12 items-center justify-center">
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

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{provider?.name || method.name}</span>
          {method.is_default && (
            <Badge color="green" size="small">
              پیش‌فرض
            </Badge>
          )}
        </div>
        <Text className="text-sm text-ui-fg-subtle">{method.provider_id}</Text>
      </div>

      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="transparent" size="small" className="size-8 p-0">
            <EllipsisVertical />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onClick={onEdit}>
            <Pencil className="mr-2" />
            ویرایش
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="text-ui-fg-error"
            onSelect={onDelete}
            disabled={isDeleting}
          >
            <Trash className="mr-2" />
            حذف
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "روش‌های پرداخت",
  icon: CurrencyDollar,
});

export default PaymentMethods;
