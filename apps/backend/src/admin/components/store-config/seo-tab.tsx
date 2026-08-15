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
import { getErrorMessage } from "../../routes/store-config/errors";

export const SeoTab = () => {
  const { data: storeConfig, isLoading, isError } = useStoreConfig();
  const saveMutation = useSaveStoreConfig();

  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState<any>({
    default_title: "",
    title_template: "",
    default_description: "",
    default_image_url: null,
    canonical_url: "",
    robots: { index: true, follow: true },
    open_graph: {},
    twitter: {},
  });

  if (storeConfig && !initialized) {
    const seo = storeConfig.seo_config ?? {};
    setForm(seo);
    setInitialized(true);
  }

  const setField = useCallback((key: string, value: unknown) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = () => {
    // Only send seo_config — server validates all
    saveMutation.mutate(
      { id: storeConfig?.id, seo_config: form } as any,
      {
        onSuccess: () => toast.success("تنظیمات SEO ذخیره شد"),
        onError: (error) => toast.error(`خطا در ذخیره SEO: ${getErrorMessage(error)}`),
      }
    );
  };

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState />;

  const seo = form ?? {};
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
        <section className="space-y-6">
          <Heading level="h3" className="mb-4">اطلاعات پایه</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="عنوان پیش‌فرض">
              <Input
                value={(seo.default_title as string) ?? ""}
                onChange={(e) => setField("default_title", e.target.value)}
                placeholder="فروشگاه من"
              />
            </FormField>

            <FormField label="قالب عنوان">
              <Input
                value={(seo.title_template as string) ?? ""}
                onChange={(e) => setField("title_template", e.target.value)}
                placeholder="%s | فروشگاه من"
              />
            </FormField>

            <FormField label="توضیحات پیش‌فرض" className="md:col-span-2">
              <Textarea
                value={(seo.default_description as string) ?? ""}
                onChange={(e) => setField("default_description", e.target.value)}
                placeholder="توضیح کوتاه برای موتورهای جستجو (حداکثر ۱۶۰ کاراکتر)"
                rows={3}
              />
            </FormField>

            <FormField label="تصویر پیش‌فرض">
              <Input
                value={(seo.default_image_url as string) ?? ""}
                onChange={(e) => setField("default_image_url", e.target.value)}
                placeholder="https://example.com/og-image.jpg"
              />
            </FormField>

            <FormField label="URL کنونیکال">
              <Input
                value={(seo.canonical_url as string) ?? ""}
                onChange={(e) => setField("canonical_url", e.target.value)}
                placeholder="https://example.com"
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-4">
          <Heading level="h3" className="mb-4">ربات‌های موتور جستجو</Heading>
          <div className="flex gap-8">
            <Label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!robots.index}
                onCheckedChange={(checked) => setField("robots", { ...robots, index: !!checked })}
              />
              Index (نمایه‌سازی)
            </Label>
            <Label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={!!robots.follow}
                onCheckedChange={(checked) => setField("robots", { ...robots, follow: !!checked })}
              />
              Follow (دنبال کردن لینک‌ها)
            </Label>
          </div>
        </section>

        <section className="space-y-6">
          <Heading level="h3" className="mb-4">Open Graph (اشتراک‌گذاری)</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField label="نام سایت">
              <Input
                value={(og.site_name as string) ?? ""}
                onChange={(e) => setField("open_graph", { ...og, site_name: e.target.value })}
              />
            </FormField>

            <FormField label="نوع">
              <Input
                value={(og.type as string) ?? "website"}
                onChange={(e) => setField("open_graph", { ...og, type: e.target.value })}
                placeholder="website"
              />
            </FormField>

            <FormField label="تصویر OG">
              <Input
                value={(og.image_url as string) ?? ""}
                onChange={(e) => setField("open_graph", { ...og, image_url: e.target.value })}
                placeholder="https://example.com/og.jpg"
              />
            </FormField>
          </div>
        </section>

        <section className="space-y-6">
          <Heading level="h3" className="mb-4">Twitter Card</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField label="نوع کارت">
              <Input
                value={(twitter.card as string) ?? "summary_large_image"}
                onChange={(e) => setField("twitter", { ...twitter, card: e.target.value })}
                placeholder="summary_large_image"
              />
            </FormField>

            <FormField label="سایت توییتر">
              <Input
                value={(twitter.site as string) ?? ""}
                onChange={(e) => setField("twitter", { ...twitter, site: e.target.value })}
                placeholder="@username"
              />
            </FormField>
          </div>
        </section>
      </div>

      <div className="flex justify-end mt-8">
        <Button isLoading={saveMutation.isPending} onClick={handleSubmit} size="large">
          ذخیره تنظیمات SEO
        </Button>
      </div>
    </Container>
  );
};

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
    <Text className="mt-2 text-ui-fg-subtle">لطفا صفحه را مجدداً بارگذاری کنید</Text>
    <Button className="mt-4" variant="secondary" onClick={() => window.location.reload()}>
      بارگذاری مجدد
    </Button>
  </Container>
);
