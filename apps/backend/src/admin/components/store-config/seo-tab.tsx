"use client";

import { useState, useCallback } from "react";
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
import { useSaveStoreConfig, useStoreConfig } from "../../routes/store-config/hooks";
import { StoreConfigInput } from "../../routes/store-config/types";
import { seoConfigSchema } from "../../routes/store-config/validation";
import {
  getErrorMessage,
  toastValidationErrors,
  zodErrorsToMap,
} from "../../routes/store-config/errors";

export const SeoTab = () => {
  const { data: storeConfig, isLoading, isError } = useStoreConfig();
  const saveMutation = useSaveStoreConfig();

  const [form, setForm] = useState<Partial<StoreConfigInput>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  if (storeConfig && !initialized) {
    const seo = storeConfig.seo_config ?? {};
    setForm({ seo_config: seo });
    setInitialized(true);
  }

  const setSeoField = useCallback(
    (key: string, value: unknown) => {
      setForm((prev) => ({
        ...prev,
        seo_config: { ...(prev.seo_config ?? {}), [key]: value },
      }));
      setErrors((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    },
    []
  );

  const handleSubmit = async () => {
    const payload = {
      ...form,
      id: storeConfig?.id,
    };

    const result = seoConfigSchema.safeParse(payload.seo_config ?? {});
    if (!result.success) {
      setErrors(zodErrorsToMap(result.error));
      toastValidationErrors(result.error);
      return;
    }

    saveMutation.mutate(
      { ...result.data, id: storeConfig?.id } as any,
      {
        onSuccess: () => toast.success("تنظیمات SEO ذخیره شد"),
        onError: (error) => toast.error(`خطا در ذخیره SEO: ${getErrorMessage(error)}`),
      }
    );
  };

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState />;

  const seo = (form.seo_config ?? {}) as any;
  const robots = seo.robots ?? {};
  const og = seo.open_graph ?? {};
  const twitter = seo.twitter ?? {};

  return (
    <Container className="p-6">
      <div className="mb-6">
        <Heading level="h2">تنظیمات SEO</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          بهینه‌سازی موتورهای جستجو و اشتراک‌گذاری در شبکه‌های اجتماعی
        </Text>
      </div>

      <div className="space-y-8">
        {/* Basic SEO */}
        <section className="space-y-6">
          <Heading level="h3" className="mb-4">اطلاعات پایه</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="عنوان پیش‌فرض" error={errors.default_title}>
              <Input
                value={(seo.default_title as string) ?? ""}
                onChange={(e) => setSeoField("default_title", e.target.value)}
                placeholder="فروشگاه من"
              />
            </FormField>

            <FormField label="قالب عنوان" error={errors.title_template}>
              <Input
                value={(seo.title_template as string) ?? ""}
                onChange={(e) => setSeoField("title_template", e.target.value)}
                placeholder="%s | فروشگاه من"
              />
            </FormField>

            <FormField label="توضیحات پیش‌فرض" error={errors.default_description} className="md:col-span-2">
              <Textarea
                value={(seo.default_description as string) ?? ""}
                onChange={(e) => setSeoField("default_description", e.target.value)}
                placeholder="توضیح کوتاه برای موتورهای جستجو (حداکثر ۱۶۰ کاراکتر)"
                rows={3}
              />
            </FormField>

            <FormField label="تصویر پیش‌فرض" error={errors.default_image_url}>
              <Input
                value={(seo.default_image_url as string) ?? ""}
                onChange={(e) => setSeoField("default_image_url", e.target.value)}
                placeholder="https://example.com/og-image.jpg"
              />
            </FormField>

            <FormField label="URL کنونیکال" error={errors.canonical_url}>
              <Input
                value={(seo.canonical_url as string) ?? ""}
                onChange={(e) => setSeoField("canonical_url", e.target.value)}
                placeholder="https://example.com"
              />
            </FormField>
          </div>
        </section>

        {/* Robots */}
        <section className="space-y-4">
          <Heading level="h3" className="mb-4">ربات‌های موتور جستجو</Heading>
          <div className="flex gap-8">
            <Label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!robots.index}
                onCheckedChange={(checked) =>
                  setSeoField("robots", { ...robots, index: !!checked })
                }
              />
              Index (نمایه‌سازی)
            </Label>
            <Label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!robots.follow}
                onCheckedChange={(checked) =>
                  setSeoField("robots", { ...robots, follow: !!checked })
                }
              />
              Follow (دنبال کردن لینک‌ها)
            </Label>
          </div>
        </section>

        {/* Open Graph */}
        <section className="space-y-6">
          <Heading level="h3" className="mb-4">Open Graph (اشتراک‌گذاری)</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField label="نام سایت" error={errors.site_name}>
              <Input
                value={(og.site_name as string) ?? ""}
                onChange={(e) =>
                  setSeoField("open_graph", { ...og, site_name: e.target.value })
                }
              />
            </FormField>

            <FormField label="نوع" error={errors.type}>
              <Input
                value={(og.type as string) ?? "website"}
                onChange={(e) =>
                  setSeoField("open_graph", { ...og, type: e.target.value })
                }
                placeholder="website"
              />
            </FormField>

            <FormField label="تصویر OG" error={errors.image_url}>
              <Input
                value={(og.image_url as string) ?? ""}
                onChange={(e) =>
                  setSeoField("open_graph", { ...og, image_url: e.target.value })
                }
                placeholder="https://example.com/og.jpg"
              />
            </FormField>
          </div>
        </section>

        {/* Twitter Card */}
        <section className="space-y-6">
          <Heading level="h3" className="mb-4">Twitter Card</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="نوع کارت" error={errors.card}>
              <Input
                value={(twitter.card as string) ?? "summary_large_image"}
                onChange={(e) =>
                  setSeoField("twitter", { ...twitter, card: e.target.value })
                }
                placeholder="summary_large_image"
              />
            </FormField>

            <FormField label="سایت توییتر" error={errors.site}>
              <Input
                value={(twitter.site as string) ?? ""}
                onChange={(e) =>
                  setSeoField("twitter", { ...twitter, site: e.target.value })
                }
                placeholder="@username"
              />
            </FormField>
          </div>
        </section>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          isLoading={saveMutation.isPending}
          onClick={handleSubmit}
          size="large"
        >
          ذخیره تنظیمات SEO
        </Button>
      </div>
    </Container>
  );
};

// ---------- Helpers ----------

const FormField = ({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`grid gap-2 ${className}`}>
    <Label>{label}</Label>
    {children}
    {error && (
      <Text size="small" className="text-ui-fg-error">
        {error}
      </Text>
    )}
  </div>
);

const LoadingSkeleton = () => (
  <Container className="p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 bg-ui-bg-base-hover rounded" />
      <div className="h-4 w-64 bg-ui-bg-base-hover rounded" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-10 bg-ui-bg-base-hover rounded" />
        <div className="h-10 bg-ui-bg-base-hover rounded" />
      </div>
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