"use client";

import { useForm, type DeepKeys } from "@tanstack/react-form";
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
import {
  useSaveStoreConfig,
  useStoreConfig,
} from "../../routes/store-config/hooks";
import { getErrorMessage } from "../../routes/store-config/errors";

/* -------------------------------------------------------------------------- */
/* Types & defaults                                                           */
/* -------------------------------------------------------------------------- */

type SeoValues = {
  default_title: string;
  title_template: string;
  default_description: string;
  default_image_url: string;
  canonical_url: string;
  enamad: string;
  robots: { index: boolean; follow: boolean };
  open_graph: { site_name: string; type: string; image_url: string };
  twitter: { card: string; site: string };
  torob: { enabled: boolean; shop_id: string; token: string };
};

type SeoPath = DeepKeys<SeoValues>;

const buildDefaults = (seo: any = {}): SeoValues => ({
  default_title: seo.default_title ?? "",
  title_template: seo.title_template ?? "",
  default_description: seo.default_description ?? "",
  default_image_url: seo.default_image_url ?? "",
  canonical_url: seo.canonical_url ?? "",
  enamad: seo.enamad ?? "",
  robots: { index: true, follow: true, ...(seo.robots ?? {}) },
  open_graph: {
    site_name: "",
    type: "website",
    image_url: "",
    ...(seo.open_graph ?? {}),
  },
  twitter: { card: "summary_large_image", site: "", ...(seo.twitter ?? {}) },
  torob: { enabled: false, shop_id: "", token: "", ...(seo.torob ?? {}) },
});

/* -------------------------------------------------------------------------- */
/* Form setup                                                                 */
/* -------------------------------------------------------------------------- */

function useSeoForm(
  defaultValues: SeoValues,
  save: (values: SeoValues) => Promise<void>,
) {
  return useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      await save(value);
      formApi.reset(value); // mark as pristine after a successful save
    },
  });
}
type SeoFormApi = ReturnType<typeof useSeoForm>;

/* -------------------------------------------------------------------------- */
/* Entry                                                                      */
/* -------------------------------------------------------------------------- */

export const SeoTab = () => {
  const { data: storeConfig, isLoading, isError } = useStoreConfig();

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !storeConfig) return <ErrorState />;

  return <SeoForm storeConfig={storeConfig} />;
};

const SeoForm = ({ storeConfig }: { storeConfig: any }) => {
  const saveMutation = useSaveStoreConfig();

  const form = useSeoForm(buildDefaults(storeConfig.seo_config), async (value) => {
    try {
      await saveMutation.mutateAsync({
        id: storeConfig.id,
        // keep any seo_config keys this tab doesn't manage; server validates all
        seo_config: { ...(storeConfig.seo_config ?? {}), ...value },
      } as any);
      toast.success("تنظیمات SEO ذخیره شد");
    } catch (error) {
      toast.error(`خطا در ذخیره SEO: ${getErrorMessage(error)}`);
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
      <BasicInfoCard form={form} />
      <RobotsCard form={form} />
      <EnamadCard form={form} />
      <OpenGraphCard form={form} />
      <TwitterCard form={form} />
    </form>
  );
};

/* -------------------------------------------------------------------------- */
/* Shared card wrapper                                                        */
/* -------------------------------------------------------------------------- */

const SeoCard = ({
  form,
  title,
  description,
  saveLabel = "ذخیره",
  children,
}: {
  form: SeoFormApi;
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

const BasicInfoCard = ({ form }: { form: SeoFormApi }) => (
  <SeoCard
    form={form}
    title="تنظیمات SEO"
    description="بهینه‌سازی موتورهای جستجو و اشتراک‌گذاری در شبکه‌های اجتماعی"
    saveLabel="ذخیره تنظیمات SEO"
  >
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <TextField form={form} name="default_title" label="عنوان پیش‌فرض" placeholder="فروشگاه من" />
      <TextField form={form} name="title_template" label="قالب عنوان" placeholder="%s | فروشگاه من" />
      <TextField
        form={form}
        name="default_description"
        label="توضیحات پیش‌فرض"
        placeholder="توضیح کوتاه برای موتورهای جستجو (حداکثر ۱۶۰ کاراکتر)"
        multiline
        className="md:col-span-2"
      />
      <TextField form={form} name="default_image_url" label="تصویر پیش‌فرض" placeholder="https://example.com/og-image.jpg" />
      <TextField form={form} name="canonical_url" label="URL کنونیکال" placeholder="https://example.com" />
    </div>
  </SeoCard>
);

const RobotsCard = ({ form }: { form: SeoFormApi }) => (
  <SeoCard
    form={form}
    title="ربات‌های موتور جستجو"
    description="کنترل نمایه‌سازی و دنبال کردن لینک‌ها"
  >
    <div className="flex gap-8">
      <CheckboxField form={form} name="robots.index" label="Index (نمایه‌سازی)" />
      <CheckboxField form={form} name="robots.follow" label="Follow (دنبال کردن لینک‌ها)" />
    </div>
  </SeoCard>
);

const EnamadCard = ({ form }: { form: SeoFormApi }) => (
  <SeoCard
    form={form}
    title="Enamad (اینماد)"
    description="کد اینماد را وارد کنید. این کد در attribute content قرار می‌گیرد."
  >
    <TextField
      form={form}
      name="enamad"
      label="کد اینماد (content)"
      placeholder="مثال: ABC123XYZ..."
    />
  </SeoCard>
);

const TorobCard = ({ form }: { form: SeoFormApi }) => (
  <SeoCard
    form={form}
    title="Torob (ترب)"
    description="تنظیمات متا تگ‌های ترب"
  >
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField form={form} name="torob.shop_id" label="Torob Shop ID" placeholder="shop_id" />
        <TextField form={form} name="torob.token" label="Torob Token" placeholder="token" />
      </div>
      <CheckboxField form={form} name="torob.enabled" label="فعال‌سازی متا تگ‌های ترب" />
    </div>
  </SeoCard>
);

const OpenGraphCard = ({ form }: { form: SeoFormApi }) => (
  <SeoCard
    form={form}
    title="Open Graph (اشتراک‌گذاری)"
    description="نحوه نمایش سایت هنگام اشتراک‌گذاری لینک"
  >
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <TextField form={form} name="open_graph.site_name" label="نام سایت" />
      <TextField form={form} name="open_graph.type" label="نوع" placeholder="website" />
      <TextField form={form} name="open_graph.image_url" label="تصویر OG" placeholder="https://example.com/og.jpg" />
    </div>
  </SeoCard>
);

const TwitterCard = ({ form }: { form: SeoFormApi }) => (
  <SeoCard form={form} title="Twitter Card">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <TextField form={form} name="twitter.card" label="نوع کارت" placeholder="summary_large_image" />
      <TextField form={form} name="twitter.site" label="سایت توییتر" placeholder="@username" />
    </div>
  </SeoCard>
);

/* -------------------------------------------------------------------------- */
/* Reusable field components                                                  */
/* -------------------------------------------------------------------------- */

const TextField = ({
  form,
  name,
  label,
  placeholder,
  multiline = false,
  className = "",
}: {
  form: SeoFormApi;
  name: SeoPath;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}) => (
  <form.Field name={name}>
    {(field) => {
      const props = {
        id: `seo_${name}`,
        value: (field.state.value as string) ?? "",
        onBlur: field.handleBlur,
        placeholder,
      };
      return (
        <div className={`grid gap-2 ${className}`}>
          <Label htmlFor={props.id}>{label}</Label>
          {multiline ? (
            <Textarea
              {...props}
              rows={3}
              onChange={(e) => field.handleChange(e.target.value as any)}
            />
          ) : (
            <Input
              {...props}
              onChange={(e) => field.handleChange(e.target.value as any)}
            />
          )}
        </div>
      );
    }}
  </form.Field>
);

const CheckboxField = ({
  form,
  name,
  label,
}: {
  form: SeoFormApi;
  name: SeoPath;
  label: string;
}) => (
  <form.Field name={name}>
    {(field) => (
      <Label className="flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={!!field.state.value}
          onCheckedChange={(checked) => field.handleChange(!!checked as any)}
        />
        {label}
      </Label>
    )}
  </form.Field>
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
