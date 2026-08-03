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
import { brandAssetsSchema } from "../../routes/store-config/validation";
import {
  getErrorMessage,
  toastValidationErrors,
  zodErrorsToMap,
} from "../../routes/store-config/errors";

export const BrandingTab = () => {
  const { data: storeConfig, isLoading, isError } = useStoreConfig();
  const saveMutation = useSaveStoreConfig();

  const [form, setForm] = useState<Partial<StoreConfigInput>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  if (storeConfig && !initialized) {
    const mc = storeConfig.marketing_config ?? {};
    setForm({
      logo_url: storeConfig.logo_url ?? "",
      logo_alt: storeConfig.logo_alt ?? "",
      favicon_url: storeConfig.favicon_url ?? "",
      marketing_config: mc,
    });
    setInitialized(true);
  }

  const uploadAdminFile = async (file: File) => {
    const body = new FormData();
    body.append("files", file, file.name);
    const response = await fetch("/admin/uploads", {
      method: "POST",
      body,
      credentials: "include",
    });
    if (!response.ok) throw new Error("آپلود فایل انجام نشد");
    const data = (await response.json()) as { files: { url: string }[] };
    return data.files[0]?.url;
  };

  const setField = useCallback((key: keyof StoreConfigInput, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleFileUpload = async (
    file: File,
    field: "logo_url" | "favicon_url"
  ) => {
    try {
      const url = await uploadAdminFile(file);
      if (url) {
        setField(field, url);
        toast.success("آپلود شد");
      }
    } catch (error) {
      toast.error(`خطا در آپلود: ${getErrorMessage(error)}`);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      id: storeConfig?.id,
    };

    const result = brandAssetsSchema.safeParse(payload);
    if (!result.success) {
      setErrors(zodErrorsToMap(result.error));
      toastValidationErrors(result.error);
      return;
    }

    saveMutation.mutate(result.data, {
      onSuccess: () => toast.success("برندینگ ذخیره شد"),
      onError: (error) => toast.error(`خطا در ذخیره برندینگ: ${getErrorMessage(error)}`),
    });
  };

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState />;

  const mc = form.marketing_config ?? {};
  const contact = mc.contact ?? ({} as any);
  const socialLinks = mc.social_links ?? {};

  return (
    <Container className="p-6">
      <div className="mb-6">
        <Heading level="h2">برندینگ و تماس</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          لوگو، فاویکون و اطلاعات تماس فروشگاه
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Logo */}
        <div className="space-y-4">
          <FormField label="لوگو" error={errors.logo_url}>
            <div className="flex gap-2">
              <Input
                value={form.logo_url ?? ""}
                onChange={(e) => setField("logo_url", e.target.value)}
                placeholder="https://..."
              />
              <FileUploadButton
                accept="image/*"
                onFile={handleFileUpload}
                field="logo_url"
              />
            </div>
          </FormField>

          <FormField label="متن جایگزین لوگو" error={errors.logo_alt}>
            <Input
              value={form.logo_alt ?? ""}
              onChange={(e) => setField("logo_alt", e.target.value)}
              placeholder="لوگو فروشگاه"
            />
          </FormField>

          {form.logo_url && (
            <div>
              <Text size="small" className="mb-2">پیش‌نمایش</Text>
              <div className="border border-ui-border-base rounded-md p-4 bg-ui-bg-subtle">
                <img
                  src={form.logo_url}
                  alt={form.logo_alt || "Logo"}
                  className="max-h-20 object-contain"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Favicon */}
        <div className="space-y-4">
          <FormField label="فاویکون" error={errors.favicon_url}>
            <div className="flex gap-2">
              <Input
                value={form.favicon_url ?? ""}
                onChange={(e) => setField("favicon_url", e.target.value)}
                placeholder="https://..."
              />
              <FileUploadButton
                accept="image/*,.ico"
                onFile={handleFileUpload}
                field="favicon_url"
              />
            </div>
          </FormField>

          {form.favicon_url && (
            <div>
              <Text size="small" className="mb-2">پیش‌نمایش</Text>
              <div className="border border-ui-border-base rounded-md p-6 bg-ui-bg-subtle flex items-center justify-center">
                <img
                  src={form.favicon_url}
                  alt="Favicon"
                  className="h-12 w-12 object-contain"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-8">
        <Heading level="h3" className="mb-4">اطلاعات تماس</Heading>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField label="آدرس">
            <Textarea
              value={contact.address ?? ""}
              onChange={(e) =>
                setField("marketing_config", {
                  ...mc,
                  contact: { ...contact, address: e.target.value },
                })
              }
              placeholder="تهران، بلوار امام علی، ..."
              rows={3}
            />
          </FormField>

          <FormField label="تلفن">
            <Input
              value={contact.phone ?? ""}
              onChange={(e) =>
                setField("marketing_config", {
                  ...mc,
                  contact: { ...contact, phone: e.target.value },
                })
              }
              placeholder="09123456789"
            />
          </FormField>
        </div>
      </div>

      {/* Social Links */}
      <div className="mt-8">
        <Heading level="h3" className="mb-4">لینک‌های شبکه‌های اجتماعی</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { value: "instagram", label: "اینستاگرام" },
            { value: "telegram", label: "تلگرام" },
            { value: "eitaa", label: "ایتا" },
            { value: "bale", label: "بله" },
            { value: "rubika", label: "روبیکا" },
            { value: "x", label: "ایکس" },
            { value: "facebook", label: "فیسبوک" },
            { value: "linkedlin", label: "لینکدین" },
            { value: "youtube", label: "یوتیوب" },
            { value: "aparat", label: "آپارات" },
            { value: "tiktok", label: "تیک توک" },
          ].map((platform) => (
            <div key={platform.value}>
              <FormField label={platform.label}>
                <Input
                  value={(socialLinks as any)[platform.value] ?? ""}
                  onChange={(e) =>
                    setField("marketing_config", {
                      ...mc,
                      social_links: {
                        ...socialLinks,
                        [platform.value]: e.target.value,
                      },
                    })
                  }
                  placeholder={`https://.../${platform.value}`}
                />
              </FormField>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          isLoading={saveMutation.isPending}
          onClick={handleSubmit}
          size="large"
        >
          ذخیره برندینگ و تماس
        </Button>
      </div>
    </Container>
  );
};

// ---------- Reusable helpers ----------

const FormField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="grid gap-2">
    <Label>{label}</Label>
    {children}
    {error && (
      <Text size="small" className="text-ui-fg-error">
        {error}
      </Text>
    )}
  </div>
);

const FileUploadButton = ({
  accept,
  onFile,
  field,
}: {
  accept: string;
  onFile: (file: File, field: "logo_url" | "favicon_url") => void;
  field: "logo_url" | "favicon_url";
}) => (
  <label className="cursor-pointer">
    <input
      type="file"
      accept={accept}
      className="hidden"
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          await onFile(file, field);
          e.target.value = "";
        }
      }}
    />
    <Button asChild variant="secondary" type="button">
      <span>آپلود</span>
    </Button>
  </label>
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
