"use client";

import { useState, useCallback } from "react";
import {
  Button,
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
import { getErrorMessage } from "../../routes/store-config/errors";

export const GeneralTab = () => {
  const { data: storeConfig, isLoading, isError } = useStoreConfig();
  const saveMutation = useSaveStoreConfig();

  const [initialized, setInitialized] = useState(false);
  const [form, setForm] = useState<Partial<StoreConfigInput>>({
    title: "",
    handle: "",
    domain: "",
    description: "",
    tagline: "",
  });

  if (storeConfig && !initialized) {
    setForm({
      title: storeConfig.title ?? "",
      handle: storeConfig.handle ?? "",
      domain: storeConfig.domain ?? "",
      description: storeConfig.description ?? "",
      tagline: (storeConfig as any).tagline ?? "",
    });
    setInitialized(true);
  }

  const setField = useCallback((key: keyof StoreConfigInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = () => {
    // Only send what this tab owns — server does all validation/parsing
    saveMutation.mutate(
      {
        id: storeConfig?.id,
        title: form.title,
        handle: form.handle,
        domain: form.domain,
        description: form.description,
        tagline: form.tagline,
      } as any,
      {
        onSuccess: () => toast.success("اطلاعات پایه ذخیره شد"),
        onError: (error) => toast.error(`خطا در ذخیره تنظیمات: ${getErrorMessage(error)}`),
      }
    );
  };

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState />;

  return (
    <Container className="p-6">
      <div className="mb-6">
        <Heading level="h2">اطلاعات فروشگاه</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          تنظیمات پایه فروشگاه خود را وارد کنید
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label="عنوان فروشگاه">
          <Input
            value={form.title ?? ""}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="فروشگاه من"
          />
        </FormField>

        <FormField label="شناسه فروشگاه">
          <Input
            value={form.handle ?? ""}
            onChange={(e) => setField("handle", e.target.value)}
            placeholder="my-store"
          />
        </FormField>

        <FormField label="دامنه">
          <Input
            value={form.domain ?? ""}
            onChange={(e) => setField("domain", e.target.value)}
            placeholder="https://example.com"
          />
        </FormField>

        <FormField label="شعار">
          <Input
            value={form.tagline ?? ""}
            onChange={(e) => setField("tagline" as any, e.target.value)}
            placeholder="فروشگاه برتر آنلاین"
          />
        </FormField>

        <div className="md:col-span-2">
          <FormField label="توضیحات">
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="توضیح مختصری درباره فروشگاه..."
              rows={3}
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button isLoading={saveMutation.isPending} onClick={handleSubmit} size="large">
          ذخیره اطلاعات پایه
        </Button>
      </div>
    </Container>
  );
};

const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid gap-2">
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
