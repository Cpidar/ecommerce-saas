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
  Select,
} from "@medusajs/ui";
import {
  useSaveStoreConfig,
  useStoreConfig,
} from "../../routes/store-config/hooks";
import { getErrorMessage } from "../../routes/store-config/errors";

export const SiteSettingsTab = () => {
  const { data: storeConfig, isLoading, isError } = useStoreConfig();
  const saveMutation = useSaveStoreConfig();

  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState<any>({
    announcement_bar: {},
    navbar: {},
    maintenance_mode: {},
    theme_tokens: {},
  });

  if (storeConfig && !initialized) {
    const cfg = storeConfig.config ?? {};
    setForm({
      announcement_bar: cfg.announcement_bar ?? {
        enabled: false,
        text: "",
        link_url: "",
        dismissible: true,
        position: "top",
      },
      navbar: cfg.navbar ?? {
        sticky: true,
        transparent: false,
        show_search: true,
        show_cart_icon: true,
      },
      maintenance_mode: cfg.maintenance_mode ?? {
        enabled: false,
        message: "",
        allowed_ips: [],
      },
      theme_tokens: cfg.theme_tokens ?? {},
    });
    setInitialized(true);
  }

  const setField = useCallback((section: string, field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }, []);

  const handleSubmit = () => {
    // Send only the `config` key — server validates + merges with existing record
    saveMutation.mutate({ config: form, id: storeConfig?.id } as any, {
      onSuccess: () => toast.success("تنظیمات سایت ذخیره شد"),
      onError: (error) =>
        toast.error(`خطا در ذخیره تنظیمات سایت: ${getErrorMessage(error)}`),
    });
  };

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState />;

  const ab = form.announcement_bar ?? {};
  const nb = form.navbar ?? {};
  const mm = form.maintenance_mode ?? {};
  const tt = form.theme_tokens ?? {};

  return (
    <>
      <div className="space-y-3">
        <Container className="p-6">
          <div className="mb-6">
            <Heading level="h2">تنظیمات سایت</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              شخصی‌سازی نوارها، منو، حالت تعمیر و رنگ‌های سایت
            </Text>
          </div>
          {/* Announcement Bar */}
          <section className="space-y-4">
            <Heading level="h3">نوار اعلان (Announcement Bar)</Heading>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ToggleField
                label="فعال"
                checked={!!ab.enabled}
                onChange={(v) => setField("announcement_bar", "enabled", v)}
              />
              <ToggleField
                label="قابل بستن توسط کاربر"
                checked={!!ab.dismissible}
                onChange={(v) => setField("announcement_bar", "dismissible", v)}
              />

              {ab.enabled && (
                <>
                  <FormField label="متن اعلان">
                    <Textarea
                      value={ab.text ?? ""}
                      onChange={(e) =>
                        setField("announcement_bar", "text", e.target.value)
                      }
                      placeholder="پیشنهاد ویژه فصلی — فقط امروز!"
                      rows={2}
                    />
                  </FormField>

                  <FormField label="لینک (URL)">
                    <Input
                      value={ab.link_url ?? ""}
                      onChange={(e) =>
                        setField("announcement_bar", "link_url", e.target.value)
                      }
                      placeholder="https://example.com/offer"
                    />
                  </FormField>

                  <FormField label="موقعیت">
                    <Select
                      value={ab.position ?? "top"}
                      onValueChange={(v) =>
                        setField(
                          "announcement_bar",
                          "position",
                          v as "top" | "bottom",
                        )
                      }
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="انتخاب موقعیت" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="top">بالا</Select.Item>
                        <Select.Item value="bottom">پایین</Select.Item>
                      </Select.Content>
                    </Select>
                  </FormField>

                  <ColorField
                    label="رنگ پس‌زمینه"
                    value={ab.bg_color ?? ""}
                    onChange={(v) =>
                      setField("announcement_bar", "bg_color", v)
                    }
                  />
                  <ColorField
                    label="رنگ متن"
                    value={ab.text_color ?? ""}
                    onChange={(v) =>
                      setField("announcement_bar", "text_color", v)
                    }
                  />
                </>
              )}
            </div>
          </section>
        </Container>
        {/* Navbar */}
        <Container className="p-6">
          <section className="space-y-4">
            <Heading level="h3">منو (Navbar)</Heading>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ToggleField
                label="چسبان (Sticky)"
                checked={nb.sticky !== false}
                onChange={(v) => setField("navbar", "sticky", v)}
              />
              <ToggleField
                label="شفاف"
                checked={!!nb.transparent}
                onChange={(v) => setField("navbar", "transparent", v)}
              />
              <ToggleField
                label="نمایش جستجو"
                checked={nb.show_search !== false}
                onChange={(v) => setField("navbar", "show_search", v)}
              />
              <ToggleField
                label="نمایش سبد خرید"
                checked={nb.show_cart_icon !== false}
                onChange={(v) => setField("navbar", "show_cart_icon", v)}
              />
            </div>
          </section>
        </Container>
        {/* Maintenance Mode */}
        <Container className="p-6">
          <section className="space-y-4">
            <Heading level="h3">حالت تعمیر (Maintenance Mode)</Heading>
            <ToggleField
              label="فعال"
              checked={!!mm.enabled}
              onChange={(v) => setField("maintenance_mode", "enabled", v)}
            />
            <FormField label="پیام نمایشی">
              <Textarea
                value={mm.message ?? ""}
                onChange={(e) =>
                  setField("maintenance_mode", "message", e.target.value)
                }
                placeholder="سایت در دست بروزرسانی است. لطفاً بعداً مراجعه کنید."
                rows={2}
              />
            </FormField>
          </section>
        </Container>
        {/* Theme Tokens */}
        <Container className="p-6">
          <section className="space-y-4">
            <Heading level="h3">رنگ‌ها و تم (Theme Tokens)</Heading>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ColorField
                label="رنگ اصلی"
                value={tt.primary ?? ""}
                onChange={(v) => setField("theme_tokens", "primary", v)}
              />
              <ColorField
                label="رنگ اصلی (Hover)"
                value={tt.primary_hover ?? ""}
                onChange={(v) => setField("theme_tokens", "primary_hover", v)}
              />
              <ColorField
                label="رنگ ثانویه"
                value={tt.secondary ?? ""}
                onChange={(v) => setField("theme_tokens", "secondary", v)}
              />
              <ColorField
                label="رنگ اکسانس"
                value={tt.accent ?? ""}
                onChange={(v) => setField("theme_tokens", "accent", v)}
              />
              <ColorField
                label="پس‌زمینه"
                value={tt.background ?? ""}
                onChange={(v) => setField("theme_tokens", "background", v)}
              />
              <ColorField
                label="متن"
                value={tt.text ?? ""}
                onChange={(v) => setField("theme_tokens", "text", v)}
              />
              <FormField label="شعاع لبه‌ها">
                <Input
                  value={tt.border_radius ?? ""}
                  onChange={(e) =>
                    setField("theme_tokens", "border_radius", e.target.value)
                  }
                  placeholder="8px"
                />
              </FormField>
              <FormField label="فونت">
                <Input
                  value={tt.font_family ?? ""}
                  onChange={(e) =>
                    setField("theme_tokens", "font_family", e.target.value)
                  }
                  placeholder="Inter, sans-serif"
                />
              </FormField>
            </div>
          </section>
        </Container>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          isLoading={saveMutation.isPending}
          onClick={handleSubmit}
          size="large"
        >
          ذخیره تنظیمات سایت
        </Button>
      </div>
    </>
  );
};

// ---------- Helpers ----------

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

const ToggleField = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center gap-3">
    <Checkbox checked={checked} onCheckedChange={onChange} />
    <Label>{label}</Label>
  </div>
);

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <FormField label={label}>
    <div className="flex gap-2">
      <Input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-10 p-0"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
      />
    </div>
  </FormField>
);

const LoadingSkeleton = () => (
  <Container className="p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 bg-ui-bg-base-hover rounded" />
      <div className="h-4 w-64 bg-ui-bg-base-hover rounded" />
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
