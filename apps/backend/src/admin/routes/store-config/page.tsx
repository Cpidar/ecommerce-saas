import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  CogSixTooth,
  CreditCard,
  TruckFast as Truck,
  Image as ImageIcon,
} from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast,
  Checkbox,
} from "@medusajs/ui";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getStoreConfig, saveStoreConfig } from "./api";
import type { StoreConfigInput } from "./types";
import { useTranslation } from "react-i18next";

export const emptyStoreConfig: StoreConfigInput = {
  medusa_store_id: "",
  title: "",
  handle: "",
  domain: "",
  description: "",
  logo_url: "",
  logo_alt: "",
  favicon_url: "",
  homepage_layout: {},
  about_page_layout: {},
  seo_config: {},
  marketing_config: {},
  config: {},
  payment_configs: {},
  shipping_method_configs: {},
};

const parseJson = (value: string, fallback = {}) => {
  if (!value.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    throw new SyntaxError("Invalid JSON");
  }
};

const StoreConfigPage = () => {
  const { t } = useTranslation("storeConfig");

  const [form, setForm] = useState<StoreConfigInput>(emptyStoreConfig);
  const [seoConfigJson, setSeoConfigJson] = useState("{}");
  const [marketingConfigJson, setMarketingConfigJson] = useState("{}");
  const [generalConfigJson, setGeneralConfigJson] = useState("{}");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const setSeoField = (key: string, value: unknown) => {
    setForm((current) => ({
      ...current,
      seo_config: { ...(current.seo_config ?? {}), [key]: value },
    }));
  };

  const setMarketingField = (key: string, value: unknown) => {
    setForm((current) => ({
      ...current,
      marketing_config: { ...(current.marketing_config ?? {}), [key]: value },
    }));
  };

  const setConfigField = (key: string, value: unknown) => {
    setForm((current) => ({
      ...current,
      config: { ...(current.config ?? {}), [key]: value },
    }));
  };

  const uploadAdminFile = async (file: File) => {
    const body = new FormData();
    body.append("files", file, file.name);

    const response = await fetch("/admin/uploads", {
      method: "POST",
      body,
      credentials: "include",
    });

    if (!response.ok) throw new Error("Unable to upload file");

    const data = (await response.json()) as { files: { url: string }[] };
    return data.files[0]?.url;
  };

  const mode = useMemo(() => (form.id ? "update" : "create"), [form.id]);

  useEffect(() => {
    getStoreConfig()
      .then((storeConfig) => {
        if (!storeConfig) return;
        setForm({ ...emptyStoreConfig, ...storeConfig });
        setSeoConfigJson(JSON.stringify(storeConfig.seo_config ?? {}, null, 2));
        setMarketingConfigJson(
          JSON.stringify(storeConfig.marketing_config ?? {}, null, 2),
        );
        setGeneralConfigJson(JSON.stringify(storeConfig.config ?? {}, null, 2));
      })
      .catch(() => toast.error(t("storeConfig.actions.saveError")))
      .finally(() => setIsLoading(false));
  }, [t]);

  const setField = <TKey extends keyof StoreConfigInput>(
    key: TKey,
    value: StoreConfigInput[TKey],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload: StoreConfigInput = {
        ...form,
        seo_config: parseJson(seoConfigJson),
        marketing_config: parseJson(marketingConfigJson),
        config: parseJson(generalConfigJson),
      };

      const saved = await saveStoreConfig(payload);
      if (saved) {
        setForm({ ...emptyStoreConfig, ...saved });
        setSeoConfigJson(JSON.stringify(saved.seo_config ?? {}, null, 2));
        setMarketingConfigJson(
          JSON.stringify(saved.marketing_config ?? {}, null, 2),
        );
        setGeneralConfigJson(JSON.stringify(saved.config ?? {}, null, 2));
      }
      toast.success(t("storeConfig.actions.success"));
    } catch (error) {
      toast.error(
        error instanceof SyntaxError
          ? t("storeConfig.actions.jsonError")
          : t("storeConfig.actions.saveError"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text>{t("storeConfig.loading")}</Text>
      </Container>
    );
  }

  return (
    <div className="max-w-[1200px]">
      <Container className="p-6 my-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <div>
            <Heading level="h1">{t("storeConfig.title")}</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              {t("storeConfig.subtitle")}
            </Text>
          </div>
          <Badge color={form.id ? "green" : "grey"}>
            {t(`storeConfig.mode.${mode}`)}
          </Badge>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 px-6 py-4">
          <Button asChild size="small" variant="secondary">
            <Link to="/store-config/payment-configs">
              <CreditCard className="mr-2" /> Payment Configs
            </Link>
          </Button>
          <Button asChild size="small" variant="secondary">
            <Link to="/store-config/shipping-method-configs">
              <Truck className="mr-2" /> Shipping Methods
            </Link>
          </Button>
        </div>
      </Container>
      {/* ==================== BASIC ==================== */}
      <Container className="p-6 my-3">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Heading level="h2">{t("storeConfig.basic.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              {t("storeConfig.basic.subtitle")}
            </Text>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">{t("storeConfig.basic.storeTitle")}</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                required
                placeholder="My Awesome Store"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="handle">{t("storeConfig.basic.handle")}</Label>
              <Input
                id="handle"
                value={form.handle}
                onChange={(e) => setField("handle", e.target.value)}
                required
                placeholder="my-store"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">{t("storeConfig.basic.domain")}</Label>
              <Input
                id="domain"
                value={form.domain}
                onChange={(e) => setField("domain", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid gap-2">
              {/* <Label htmlFor="medusa_store_id">
                {t("storeConfig.basic.medusaStoreId")}
              </Label> */}
              <Input
                id="medusa_store_id"
                value={form.medusa_store_id}
                onChange={(e) => setField("medusa_store_id", e.target.value)}
                required
                hidden
              />
            </div>
            <div className="md:col-span-2 grid gap-2">
              <Label htmlFor="description">
                {t("storeConfig.basic.description")}
              </Label>
              <Textarea
                id="description"
                value={form.description ?? ""}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="A short description of your store..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button isLoading={isSaving} type="submit" size="large">
              {isSaving
                ? t("storeConfig.actions.saving")
                : t("storeConfig.actions.save")}
            </Button>
          </div>
        </form>
      </Container>

      {/* ==================== Marketing ==================== */}
      <Container className="p-6 my-3">
        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex items-center gap-2">
            <Heading level="h2">{t("storeConfig.info.title")}</Heading>
          </div>
          <Text size="small" className="text-ui-fg-subtle mb-6">
            {t("storeConfig.info.subtitle")}
          </Text>

          <Container className="my-3">
            <Label className="block mb-4">
              {t("storeConfig.contact.socialLinks")}
            </Label>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label>{t("storeConfig.info.logoUrl")}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.logo_url ?? ""}
                      onChange={(e) => setField("logo_url", e.target.value)}
                      placeholder="https://..."
                    />
                    <Button asChild variant="secondary" type="button">
                      <label htmlFor="logo_upload" className="cursor-pointer">
                        {t("storeConfig.info.upload")}
                      </label>
                    </Button>
                    <input
                      id="logo_upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadAdminFile(file);
                          if (url) {
                            setField("logo_url", url);
                            toast.success("Logo uploaded");
                          }
                        } catch {
                          toast.error("Upload failed");
                        } finally {
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="logo_alt">
                    {t("storeConfig.info.logoAlt")}
                  </Label>
                  <Input
                    id="logo_alt"
                    value={form.logo_alt ?? ""}
                    onChange={(e) => setField("logo_alt", e.target.value)}
                    placeholder="Store logo"
                  />
                </div>

                {form.logo_url && (
                  <div>
                    <Text size="small" className="mb-2">
                      {t("storeConfig.info.preview")}
                    </Text>
                    <div className="border border-ui-border-base rounded-md p-4 bg-ui-bg-subtle">
                      <img
                        src={form.logo_url}
                        alt={form.logo_alt || "Logo"}
                        className="max-h-20 object-contain"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).style.display =
                            "none")
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label>{t("storeConfig.info.faviconUrl")}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.favicon_url ?? ""}
                      onChange={(e) => setField("favicon_url", e.target.value)}
                      placeholder="https://..."
                    />
                    <Button asChild variant="secondary" type="button">
                      <label
                        htmlFor="favicon_upload"
                        className="cursor-pointer"
                      >
                        {t("storeConfig.info.upload")}
                      </label>
                    </Button>
                    <input
                      id="favicon_upload"
                      type="file"
                      accept="image/*,.ico"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadAdminFile(file);
                          if (url) {
                            setField("favicon_url", url);
                            toast.success("Favicon uploaded");
                          }
                        } catch {
                          toast.error("Upload failed");
                        } finally {
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                </div>

                {form.favicon_url && (
                  <div>
                    <Text size="small" className="mb-2">
                      {t("storeConfig.info.preview")}
                    </Text>
                    <div className="border border-ui-border-base rounded-md p-6 bg-ui-bg-subtle flex items-center justify-center">
                      <img
                        src={form.favicon_url}
                        alt="Favicon"
                        className="h-12 w-12 object-contain"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).style.display =
                            "none")
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>

          <Container className="my-3">
            <Label className="block mb-4">
              {t("storeConfig.contact.socialLinks")}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {/* Contacts */}
              <div>
                <div>
                  <div className="md:col-span-2 grid gap-2">
                    <Label htmlFor="address">
                      {t("storeConfig.contact.address")}
                    </Label>
                    <Textarea
                      id="address"
                      value={
                        (
                          form.marketing_config?.contact as Record<
                            string,
                            string
                          >
                        )?.address ?? ""
                      }
                      onChange={(e) =>
                        setMarketingField("contact", {
                          ...((form.marketing_config?.contact as Record<
                            string,
                            unknown
                          >) ?? {}),
                          ["address"]: e.target.value,
                        })
                      }
                      placeholder="تهران، بلوار امام علی، ..."
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <div className="md:col-span-2 grid gap-2">
                    <Label htmlFor="phone">
                      {t("storeConfig.contact.phone")}
                    </Label>
                    <Input
                      id="phone"
                      value={
                        (
                          form.marketing_config?.contact as Record<
                            string,
                            string
                          >
                        )?.phone ?? ""
                      }
                      onChange={(e) =>
                        setMarketingField("contact", {
                          ...((form.marketing_config?.contact as Record<
                            string,
                            unknown
                          >) ?? {}),
                          ["phone"]: e.target.value,
                        })
                      }
                      placeholder="09123456789"
                    />
                  </div>
                </div>
              </div>
              {/* Socials */}
              <div>
                {[
                  { value: "instagram", label: "اینستاگرام"},
                  { value: "telegram", label: "تلگرام"},
                  { value: "eitaa", label: "ایتا"},
                  { value: "bale", label: "بله"},
                  { value: "rubika", label: "روبیکا"},
                  { value: "x", label: "ایکس"},
                  { value: "facebook", label: "فیسبوک"},
                  { value: "linkedlin", label: "لینکدین"},
                  { value: "youtube", label: "یوتیوب"},
                  { value: "aparat", label: "آپارات"},
                  { value: "tiktok", label: "تیک تاک"},
                ].map((platform) => (
                  <div key={platform.value} className="grid gap-2">
                    <Label
                      htmlFor={`social_${platform}`}
                      className="capitalize"
                    >
                      {platform.label}
                    </Label>
                    <Input
                      id={`social_${platform.value}`}
                      value={
                        (((form.marketing_config?.social_links as Record<
                          string,
                          unknown
                        >) ?? {})[platform.value] as string) ?? ""
                      }
                      onChange={(e) =>
                        setMarketingField("social_links", {
                          ...((form.marketing_config?.social_links as Record<
                            string,
                            unknown
                          >) ?? {}),
                          [platform.value]: e.target.value,
                        })
                      }
                      placeholder={`https://.../${platform}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Container>

          <div className="text-ui-fg-subtle text-sm self-center">
            {t("storeConfig.info.moreSettings")}
          </div>

          <div className="flex justify-end mt-8">
            <Button isLoading={isSaving} type="submit" size="large">
              {isSaving
                ? t("storeConfig.actions.saving")
                : t("storeConfig.actions.save")}
            </Button>
          </div>
        </form>
      </Container>

      {/* ==================== Site Setting ==================== */}
      <Container className="p-6 my-3">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Heading level="h2">{t("storeConfig.site.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              {t("storeConfig.site.subtitle")}
            </Text>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="announcement">
                  {t("storeConfig.site.announcement")}
                </Label>
                <Textarea
                  id="announcement"
                  value={
                    ((
                      (form.marketing_config?.social_links as Record<
                        string,
                        unknown
                      >) ?? {}
                    )?.announcement as string) ?? ""
                  }
                  onChange={(e) =>
                    setConfigField("announcement", {
                      ...((form.marketing_config?.social_links as Record<
                        string,
                        unknown
                      >) ?? {}),
                      announcement: e.target.value,
                    })
                  }
                  placeholder="متن نوار بالای سایت (برای عدم نمایش خالی بگذارید)"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label>{t("storeConfig.site.googleAnalytics")}</Label>
                <Input
                  value={
                    (form.marketing_config?.google_analytics_id as string) ?? ""
                  }
                  onChange={(e) =>
                    setMarketingField("google_analytics_id", e.target.value)
                  }
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("storeConfig.site.googleTagManager")}</Label>
                <Input
                  value={
                    (form.marketing_config?.google_tag_manager_id as string) ??
                    ""
                  }
                  onChange={(e) =>
                    setMarketingField("google_tag_manager_id", e.target.value)
                  }
                  placeholder="GTM-XXXXXX"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <Button isLoading={isSaving} type="submit" size="large">
              {isSaving
                ? t("storeConfig.actions.saving")
                : t("storeConfig.actions.save")}
            </Button>
          </div>
        </form>
      </Container>

      {/* ==================== SEO ==================== */}
      <Container className="p-6 my-3">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Heading level="h2">{t("storeConfig.seo.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              {t("storeConfig.seo.subtitle")}
            </Text>
          </div>

          <div className="space-y-8">
            {/* SEO fields - same as before */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>{t("storeConfig.seo.defaultTitle")}</Label>
                <Input
                  value={(form.seo_config?.default_title as string) ?? ""}
                  onChange={(e) => setSeoField("default_title", e.target.value)}
                  placeholder="My Store"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("storeConfig.seo.titleTemplate")}</Label>
                <Input
                  value={(form.seo_config?.title_template as string) ?? ""}
                  onChange={(e) =>
                    setSeoField("title_template", e.target.value)
                  }
                  placeholder="%s | My Store"
                />
              </div>

              <div className="md:col-span-2 grid gap-2">
                <Label>{t("storeConfig.seo.defaultDescription")}</Label>
                <Textarea
                  value={(form.seo_config?.default_description as string) ?? ""}
                  onChange={(e) =>
                    setSeoField("default_description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label>{t("storeConfig.seo.defaultImageUrl")}</Label>
                <Input
                  value={(form.seo_config?.default_image_url as string) ?? ""}
                  onChange={(e) =>
                    setSeoField("default_image_url", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("storeConfig.seo.canonicalUrl")}</Label>
                <Input
                  value={(form.seo_config?.canonical_url as string) ?? ""}
                  onChange={(e) => setSeoField("canonical_url", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                {t("storeConfig.seo.robots")}
              </Label>
              <div className="flex gap-8">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={!!(form.seo_config?.robots as any)?.index}
                    onCheckedChange={(checked) =>
                      setSeoField("robots", {
                        ...((form.seo_config?.robots as any) ?? {}),
                        index: !!checked,
                      })
                    }
                  />
                  {t("storeConfig.seo.index")}
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={!!(form.seo_config?.robots as any)?.follow}
                    onCheckedChange={(checked) =>
                      setSeoField("robots", {
                        ...((form.seo_config?.robots as any) ?? {}),
                        follow: !!checked,
                      })
                    }
                  />
                  {t("storeConfig.seo.follow")}
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>{t("storeConfig.seo.ogSiteName")}</Label>
                <Input
                  value={
                    ((form.seo_config?.open_graph as any)
                      ?.site_name as string) ?? ""
                  }
                  onChange={(e) =>
                    setSeoField("open_graph", {
                      ...((form.seo_config?.open_graph as any) ?? {}),
                      site_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("storeConfig.seo.ogType")}</Label>
                <Input
                  value={
                    ((form.seo_config?.open_graph as any)?.type as string) ??
                    "website"
                  }
                  onChange={(e) =>
                    setSeoField("open_graph", {
                      ...((form.seo_config?.open_graph as any) ?? {}),
                      type: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("storeConfig.seo.twitterCard")}</Label>
                <Input
                  value={
                    ((form.seo_config?.twitter as any)?.card as string) ??
                    "summary_large_image"
                  }
                  onChange={(e) =>
                    setSeoField("twitter", {
                      ...((form.seo_config?.twitter as any) ?? {}),
                      card: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button isLoading={isSaving} type="submit" size="large">
              {isSaving
                ? t("storeConfig.actions.saving")
                : t("storeConfig.actions.save")}
            </Button>
          </div>
        </form>
      </Container>

      {/* ==================== ADVANCED ==================== */}
      <Container className="p-6 my-3">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <Heading level="h2">{t("storeConfig.advanced.title")}</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                {t("storeConfig.advanced.subtitle")}
              </Text>
            </div>
            <Button
              variant="secondary"
              size="small"
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced
                ? t("storeConfig.advanced.hide")
                : t("storeConfig.advanced.show")}
            </Button>
          </div>

          {showAdvanced && (
            <div className="space-y-8">
              <div>
                <Label>{t("storeConfig.advanced.seoJson")}</Label>
                <Textarea
                  value={seoConfigJson}
                  onChange={(e) => setSeoConfigJson(e.target.value)}
                  className="font-mono text-sm mt-2"
                  rows={8}
                />
              </div>
              <div>
                <Label>{t("storeConfig.advanced.marketingJson")}</Label>
                <Textarea
                  value={marketingConfigJson}
                  onChange={(e) => setMarketingConfigJson(e.target.value)}
                  className="font-mono text-sm mt-2"
                  rows={8}
                />
              </div>

              <div>
                <Label>{t("storeConfig.advanced.generalJson")}</Label>
                <Textarea
                  value={generalConfigJson}
                  onChange={(e) => setGeneralConfigJson(e.target.value)}
                  className="font-mono text-sm mt-2"
                  rows={8}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end mt-8">
            <Button isLoading={isSaving} type="submit" size="large">
              {isSaving
                ? t("storeConfig.actions.saving")
                : t("storeConfig.actions.save")}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Store Config",
  icon: CogSixTooth,
});

export const handle = {
  breadcrumb: () => "Store Config",
};
export default StoreConfigPage;
