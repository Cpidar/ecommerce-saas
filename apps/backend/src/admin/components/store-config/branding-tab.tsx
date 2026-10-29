"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
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
import {
  useSaveStoreConfig,
  useStoreConfig,
} from "../../routes/store-config/hooks";
import { getErrorMessage } from "../../routes/store-config/errors";

/* -------------------------------------------------------------------------- */
/* Constants, types, helpers                                                  */
/* -------------------------------------------------------------------------- */

const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "اینستاگرام" },
  { value: "x", label: "ایکس (Twitter)" },
  { value: "facebook", label: "فیسبوک" },
  { value: "linkedin", label: "لینکدین" },
  { value: "youtube", label: "یوتیوب" },
  { value: "tiktok", label: "تیک‌توک" },
] as const;

type BrandingValues = {
  logo_url: string;
  logo_alt: string;
  favicon_url: string;
  marketing_config: {
    contact: { address: string; phone: string };
    social_links: Record<string, string>;
    [key: string]: unknown; // keys owned by other tabs
  };
};

type ImageFieldName = "logo_url" | "favicon_url";

const buildDefaults = (config: any): BrandingValues => {
  const mc = config.marketing_config ?? {};
  return {
    logo_url: config.logo_url ?? "",
    logo_alt: config.logo_alt ?? "",
    favicon_url: config.favicon_url ?? "",
    marketing_config: {
      ...mc,
      contact: { address: "", phone: "", ...(mc.contact ?? {}) },
      social_links: {
        ...Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.value, ""])),
        ...(mc.social_links ?? {}),
      },
    },
  };
};

async function uploadAdminFile(file: File): Promise<string | undefined> {
  const body = new FormData();
  body.append("files", file, file.name);
  const res = await fetch("/admin/uploads", {
    method: "POST",
    body,
    credentials: "include",
  });
  if (!res.ok) throw new Error("آپلود فایل انجام نشد");
  const data = (await res.json()) as { files: { url: string }[] };
  return data.files[0]?.url;
}

/* -------------------------------------------------------------------------- */
/* Form setup                                                                 */
/* -------------------------------------------------------------------------- */

function useBrandingForm(
  defaultValues: BrandingValues,
  save: (values: BrandingValues) => Promise<void>,
) {
  return useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      await save(value);
      formApi.reset(value); // mark as pristine after a successful save
    },
  });
}
type BrandingFormApi = ReturnType<typeof useBrandingForm>;

/* -------------------------------------------------------------------------- */
/* Entry                                                                      */
/* -------------------------------------------------------------------------- */

export const BrandingTab = () => {
  const { data: storeConfig, isLoading, isError } = useStoreConfig();

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !storeConfig) return <ErrorState />;

  return <BrandingForm storeConfig={storeConfig} />;
};

const BrandingForm = ({ storeConfig }: { storeConfig: any }) => {
  const saveMutation = useSaveStoreConfig();

  const form = useBrandingForm(buildDefaults(storeConfig), async (value) => {
    try {
      await saveMutation.mutateAsync({
        id: storeConfig.id,
        logo_url: value.logo_url || null,
        logo_alt: value.logo_alt || null,
        favicon_url: value.favicon_url || null,
        marketing_config: value.marketing_config,
      } as any);
      toast.success("برندینگ ذخیره شد");
    } catch (error) {
      toast.error(`خطا در ذخیره برندینگ: ${getErrorMessage(error)}`);
    }
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <LogoCard form={form} />
      <ContactCard form={form} />
      <SocialLinksCard form={form} />
    </form>
  );
};

/* -------------------------------------------------------------------------- */
/* Shared card wrapper                                                        */
/* -------------------------------------------------------------------------- */

const BrandingCard = ({
  form,
  title,
  description,
  saveLabel = "ذخیره",
  children,
}: {
  form: BrandingFormApi;
  title: string;
  description?: string;
  saveLabel?: string;
  children: React.ReactNode;
}) => (
  <Container className="p-6">
    <div className="mb-6 border-b border-ui-border-base pb-4">
      <Heading level="h2">{title}</Heading>
      {description && (
        <Text size="small" className="mt-1 text-ui-fg-subtle">
          {description}
        </Text>
      )}
    </div>

    {children}

    <div className="mt-8 flex justify-end">
      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" size="large" isLoading={isSubmitting}>
            {saveLabel}
          </Button>
        )}
      </form.Subscribe>
    </div>
  </Container>
);

/* -------------------------------------------------------------------------- */
/* Section cards                                                              */
/* -------------------------------------------------------------------------- */

const LogoCard = ({ form }: { form: BrandingFormApi }) => (
  <BrandingCard
    form={form}
    title="لوگو و فاوایکون"
    description="لوگوی فروشگاه و متن جایگزین آن"
  >
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div className="space-y-4">
        <ImageUrlField
          form={form}
          name="logo_url"
          label="آدرس لوگو"
          accept="image/*"
        />

        <form.Field name="logo_alt">
          {(field) => (
            <FormField label="متن جایگزین لوگو">
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="لوگو فروشگاه"
              />
            </FormField>
          )}
        </form.Field>

        <form.Subscribe
          selector={(s) => [s.values.logo_url, s.values.logo_alt]}
        >
          {([url, alt]) =>
            url ? (
              <ImagePreview
                src={url}
                alt={alt || "Logo"}
                boxClassName="p-4"
                imgClassName="max-h-20"
              />
            ) : null
          }
        </form.Subscribe>
      </div>
      <div className="space-y-4">
        <ImageUrlField
          form={form}
          name="favicon_url"
          label="آدرس فاویکون"
          accept="image/*,.ico"
        />

        <form.Subscribe selector={(s) => s.values.favicon_url}>
          {(url) =>
            url ? (
              <ImagePreview
                src={url}
                alt="Favicon"
                boxClassName="flex items-center justify-center p-6"
                imgClassName="h-12 w-12"
              />
            ) : null
          }
        </form.Subscribe>
      </div>
    </div>
  </BrandingCard>
);

const ContactCard = ({ form }: { form: BrandingFormApi }) => (
  <BrandingCard
    form={form}
    title="اطلاعات تماس"
    description="آدرس و شماره تلفن فروشگاه"
  >
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <form.Field name="marketing_config.contact.address">
        {(field) => (
          <FormField label="آدرس">
            <Textarea
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="تهران، بلوار امام علی، ..."
              rows={3}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="marketing_config.contact.phone">
        {(field) => (
          <FormField label="تلفن">
            <Input
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="09123456789"
            />
          </FormField>
        )}
      </form.Field>
    </div>
  </BrandingCard>
);

const SocialLinksCard = ({ form }: { form: BrandingFormApi }) => (
  <BrandingCard
    form={form}
    title="لینک‌های شبکه‌های اجتماعی"
    description="آدرس صفحات رسمی فروشگاه"
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SOCIAL_PLATFORMS.map((p) => (
        <form.Field
          key={p.value}
          name={`marketing_config.social_links.${p.value}`}
        >
          {(field) => (
            <FormField label={p.label}>
              <Input
                value={(field.state.value as string) ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={`https://.../${p.value}`}
              />
            </FormField>
          )}
        </form.Field>
      ))}
    </div>
  </BrandingCard>
);

/* -------------------------------------------------------------------------- */
/* Reusable pieces                                                            */
/* -------------------------------------------------------------------------- */

// URL input + upload button, shared by the logo and favicon cards
const ImageUrlField = ({
  form,
  name,
  label,
  accept,
}: {
  form: BrandingFormApi;
  name: ImageFieldName;
  label: string;
  accept: string;
}) => {
  const upload = async (file: File) => {
    try {
      const url = await uploadAdminFile(file);
      if (url) {
        form.setFieldValue(name, url);
        toast.success("آپلود شد");
      }
    } catch (error) {
      toast.error(`خطا در آپلود: ${getErrorMessage(error)}`);
    }
  };

  return (
    <form.Field name={name}>
      {(field) => (
        <FormField label={label}>
          <div className="flex gap-2">
            <Input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://..."
            />
            <FileUploadButton accept={accept} onFile={upload} />
          </div>
        </FormField>
      )}
    </form.Field>
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

const ImagePreview = ({
  src,
  alt,
  boxClassName = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  boxClassName?: string;
  imgClassName?: string;
}) => {
  // Track which src failed, so a new URL automatically gets a fresh attempt
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (failedSrc === src) return null;

  return (
    <div>
      <Text size="small" className="mb-2">
        پیش‌نمایش
      </Text>
      <div
        className={`rounded-md border border-ui-border-base bg-ui-bg-subtle ${boxClassName}`}
      >
        <img
          src={src}
          alt={alt}
          className={`object-contain ${imgClassName}`}
          onError={() => setFailedSrc(src)}
        />
      </div>
    </div>
  );
};

const FileUploadButton = ({
  accept,
  onFile,
}: {
  accept: string;
  onFile: (file: File) => Promise<void>;
}) => (
  <label className="cursor-pointer">
    <input
      type="file"
      accept={accept}
      className="hidden"
      onChange={async (e) => {
        const input = e.currentTarget; // grab before the await
        const file = input.files?.[0];
        if (!file) return;
        await onFile(file);
        input.value = ""; // allow re-selecting the same file
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
      <div className="h-6 w-48 rounded bg-ui-bg-base-hover" />
      <div className="h-4 w-64 rounded bg-ui-bg-base-hover" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-10 rounded bg-ui-bg-base-hover" />
        <div className="h-10 rounded bg-ui-bg-base-hover" />
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
    <Button
      className="mt-4"
      variant="secondary"
      onClick={() => window.location.reload()}
    >
      بارگذاری مجدد
    </Button>
  </Container>
);
