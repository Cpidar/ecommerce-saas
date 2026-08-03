"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Container,
  Heading,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useSaveStoreConfig, useStoreConfig } from "../../routes/store-config/hooks";
import { StoreConfigInput } from "../../routes/store-config/types";
import { getErrorMessage } from "../../routes/store-config/errors";

const TAB = {
  FULL: "full",
  SEO: "seo_config",
  MARKETING: "marketing_config",
  GENERAL: "config",
  PAYMENT: "payment_configs",
  SHIPPING: "shipping_method_configs",
} as const;

type TabKey = (typeof TAB)[keyof typeof TAB];

const TAB_LABELS: Record<TabKey, string> = {
  full: "کل تنظیمات",
  seo_config: "تنظیمات SEO",
  marketing_config: "تنظیمات بازاریابی",
  config: "تنظیمات عمومی",
  payment_configs: "تنظیمات پرداخت",
  shipping_method_configs: "تنظیمات ارسال",
};

export const AdvancedTab = () => {
  const { data: storeConfig, isLoading, isError } = useStoreConfig();
  const saveMutation = useSaveStoreConfig();

  const [jsonTab, setJsonTab] = useState<TabKey>("full");
  const [jsonValue, setJsonValue] = useState("{}");
  const [isFormatting, setIsFormatting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (storeConfig && !initialized) {
      setJsonValue(formatJson(getSubset(storeConfig, jsonTab)));
      setInitialized(true);
    }
  }, [storeConfig, jsonTab, initialized]);

  // When tab changes while data is loaded, rebuild JSON
  const handleTabChange = (tab: TabKey) => {
    setJsonTab(tab);
    if (storeConfig) {
      setJsonValue(formatJson(getSubset(storeConfig, tab)));
    }
    setInitialized(false);
  };

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(jsonValue);

      let payload: Partial<StoreConfigInput> = { id: storeConfig?.id };

      if (jsonTab === "full") {
        payload = { ...parsed, id: storeConfig?.id };
      } else {
        payload = {
          id: storeConfig?.id,
          [jsonTab]: parsed,
        } as any;
        // Keep non-selected configs intact
        const keepFields = ["seo_config", "marketing_config", "config", "payment_configs", "shipping_method_configs"] as const;
        for (const field of keepFields) {
          if (field !== jsonTab && storeConfig?.[field]) {
            (payload as any)[field] = storeConfig[field];
          }
        }
      }

      saveMutation.mutate(payload, {
        onSuccess: () => toast.success("تنظیمات JSON ذخیره شد"),
        onError: (error) => toast.error(`خطا در ذخیره تنظیمات JSON: ${getErrorMessage(error)}`),
      });
    } catch {
      toast.error("JSON نامعتبر است — لطفا ساختار JSON را بررسی کنید");
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      setJsonValue(formatJson(parsed));
      toast.success("JSON فرمت شد");
    } catch (error) {
      const message = error instanceof SyntaxError ? error.message : "JSON نامعتبر است";
      toast.error(`JSON نامعتبر است — ${message}`);
    }
  };

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState />;

  return (
    <Container className="p-6">
      <div className="mb-6">
        <Heading level="h2">ویرایش پیشرفته (JSON)</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          ویرایش مستقیم تنظیمات فروشگاه در قالب JSON. برای کاربران حرفه‌ای.
        </Text>
      </div>

      {/* Tab selector for JSON sections */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.entries(TAB_LABELS) as [TabKey, string][]).map(([key, label]) => (
          <Button
            key={key}
            variant={jsonTab === key ? "primary" : "secondary"}
            size="small"
            onClick={() => handleTabChange(key)}
            type="button"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>JSON</Label>
          <Textarea
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            className="min-h-[400px] font-mono text-sm leading-relaxed"
            placeholder="{ }"
            spellCheck={false}
          />
        </div>

        <div className="flex justify-between items-center">
          <Text size="small" className="text-ui-fg-subtle">
            با دقت ویرایش کنید — خطا در JSON باعث خرابی تنظیمات می‌شود
          </Text>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={handleFormat}
              disabled={isFormatting}
            >
              فرمت JSON
            </Button>
            <Button
              isLoading={saveMutation.isPending}
              onClick={handleSave}
              type="button"
            >
              ذخیره JSON
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
};

// ---------- Helpers ----------

const formatJson = (value: unknown): string =>
  JSON.stringify(value, null, 2);

const getSubset = (
  storeConfig: StoreConfigInput,
  tab: TabKey
): unknown => {
  if (tab === "full") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, medusa_store_id, homepage_layout, about_page_layout, ...rest } = storeConfig;
    return rest;
  }
  return storeConfig[tab] ?? {};
};

const LoadingSkeleton = () => (
  <Container className="p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 bg-ui-bg-base-hover rounded" />
      <div className="h-4 w-64 bg-ui-bg-base-hover rounded" />
      <div className="h-[400px] bg-ui-bg-base-hover rounded" />
    </div>
  </Container>
);

const ErrorState = () => (
  <Container className="flex flex-col items-center justify-center py-12">
    <Heading level="h2">خطا در دریافت تنظیمات</Heading>
    <Text className="mt-2 text-ui-fg-subtle">
      لطفا صفحه را مجدداً بارگذاری کنید
    </Text>
    <Button className="mt-4" variant="secondary" onClick={() => window.location.reload()}>
      بارگذاری مجدد
    </Button>
  </Container>
);