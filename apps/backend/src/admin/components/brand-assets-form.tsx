import {
  Button,
  Checkbox,
  Heading,
  Input,
  Label,
  Textarea,
  toast,
} from "@medusajs/ui";
import { StoreConfigInput } from "../routes/store-config/types";
import { useState } from "react";
import { emptyStoreConfig } from "../routes/store-config/page";
import { sdk } from "../lib/sdk";

export const BrandAssetsForm = () => {
  const [form, setForm] = useState<StoreConfigInput>(emptyStoreConfig);

  const setField = <TKey extends keyof StoreConfigInput>(
    key: TKey,
    value: StoreConfigInput[TKey],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const setSeoField = (key: string, value: unknown) => {
    setForm((current) => ({
      ...current,
      seo_config: {
        ...(current.seo_config ?? {}),
        [key]: value,
      },
    }));
  };

  const setMarketingField = (key: string, value: unknown) => {
    setForm((current) => ({
      ...current,
      marketing_config: {
        ...(current.marketing_config ?? {}),
        [key]: value,
      },
    }));
  };

  const uploadAdminFile = async (file: File) => {
    const body = new FormData();

    body.append("files", file);

    const response = await sdk.client.fetch<{
      files: { url: string }[];
    }>("/admin/uploads", {
      method: "POST",
      body,
    });

    return response.files[0]?.url;
  };
  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <Heading level="h2">Brand Assets</Heading>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="logo_url">Logo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="logo_url"
                value={form.logo_url ?? ""}
                onChange={(event) => setField("logo_url", event.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <Button asChild variant="secondary" type="button">
                <label htmlFor="logo_upload">Upload</label>
              </Button>
              <input
                className="hidden"
                id="logo_upload"
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  try {
                    const url = await uploadAdminFile(file);

                    if (url) {
                      setField("logo_url", url);
                      toast.success("Logo uploaded");
                    }
                  } catch {
                    toast.error("Unable to upload logo");
                  } finally {
                    event.target.value = "";
                  }
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="logo_alt">Logo Alt Text</Label>
            <Input
              id="logo_alt"
              value={form.logo_alt ?? ""}
              onChange={(event) => setField("logo_alt", event.target.value)}
              placeholder="Store logo"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="favicon_url">Favicon</Label>
            <div className="flex items-center gap-2">
              <Input
                id="favicon_url"
                value={form.favicon_url ?? ""}
                onChange={(event) =>
                  setField("favicon_url", event.target.value)
                }
                placeholder="https://example.com/favicon.ico"
              />
              <Button asChild variant="secondary" type="button">
                <label htmlFor="favicon_upload">Upload</label>
              </Button>
              <input
                className="hidden"
                id="favicon_upload"
                type="file"
                accept="image/*,.ico"
                onChange={async (event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  try {
                    const url = await uploadAdminFile(file);

                    if (url) {
                      setField("favicon_url", url);
                      toast.success("Favicon uploaded");
                    }
                  } catch {
                    toast.error("Unable to upload favicon");
                  } finally {
                    event.target.value = "";
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <Heading level="h2">SEO</Heading>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="seo_default_title">Default Title</Label>
            <Input
              id="seo_default_title"
              value={(form.seo_config?.default_title as string) ?? ""}
              onChange={(event) =>
                setSeoField("default_title", event.target.value)
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seo_title_template">Title Template</Label>
            <Input
              id="seo_title_template"
              value={(form.seo_config?.title_template as string) ?? ""}
              onChange={(event) =>
                setSeoField("title_template", event.target.value)
              }
              placeholder="%s | Store Name"
            />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="seo_default_description">Default Description</Label>
            <Textarea
              id="seo_default_description"
              value={(form.seo_config?.default_description as string) ?? ""}
              onChange={(event) =>
                setSeoField("default_description", event.target.value)
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seo_default_image_url">Default Image URL</Label>
            <Input
              id="seo_default_image_url"
              value={(form.seo_config?.default_image_url as string) ?? ""}
              onChange={(event) =>
                setSeoField("default_image_url", event.target.value)
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seo_canonical_url">Canonical URL</Label>
            <Input
              id="seo_canonical_url"
              value={(form.seo_config?.canonical_url as string) ?? ""}
              onChange={(event) =>
                setSeoField("canonical_url", event.target.value)
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <Label className="flex items-center gap-2">
            <Checkbox
              checked={
                ((form.seo_config?.robots as Record<string, unknown>)?.index ??
                  true) as boolean
              }
              onCheckedChange={(checked) =>
                setSeoField("robots", {
                  ...((form.seo_config?.robots as Record<string, unknown>) ??
                    {}),
                  index: checked === true,
                })
              }
            />
            Index
          </Label>

          <Label className="flex items-center gap-2">
            <Checkbox
              checked={
                ((form.seo_config?.robots as Record<string, unknown>)?.follow ??
                  true) as boolean
              }
              onCheckedChange={(checked) =>
                setSeoField("robots", {
                  ...((form.seo_config?.robots as Record<string, unknown>) ??
                    {}),
                  follow: checked === true,
                })
              }
            />
            Follow
          </Label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="og_site_name">Open Graph Site Name</Label>
            <Input
              id="og_site_name"
              value={
                ((form.seo_config?.open_graph as Record<string, unknown>)
                  ?.site_name as string) ?? ""
              }
              onChange={(event) =>
                setSeoField("open_graph", {
                  ...((form.seo_config?.open_graph as Record<
                    string,
                    unknown
                  >) ?? {}),
                  site_name: event.target.value,
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="og_type">Open Graph Type</Label>
            <Input
              id="og_type"
              value={
                ((form.seo_config?.open_graph as Record<string, unknown>)
                  ?.type as string) ?? "website"
              }
              onChange={(event) =>
                setSeoField("open_graph", {
                  ...((form.seo_config?.open_graph as Record<
                    string,
                    unknown
                  >) ?? {}),
                  type: event.target.value,
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="twitter_card">Twitter Card</Label>
            <Input
              id="twitter_card"
              value={
                ((form.seo_config?.twitter as Record<string, unknown>)
                  ?.card as string) ?? "summary_large_image"
              }
              onChange={(event) =>
                setSeoField("twitter", {
                  ...((form.seo_config?.twitter as Record<string, unknown>) ??
                    {}),
                  card: event.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <Heading level="h2">Marketing</Heading>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
            <Input
              id="google_analytics_id"
              value={
                (form.marketing_config?.google_analytics_id as string) ?? ""
              }
              onChange={(event) =>
                setMarketingField("google_analytics_id", event.target.value)
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
            <Input
              id="google_tag_manager_id"
              value={
                (form.marketing_config?.google_tag_manager_id as string) ?? ""
              }
              onChange={(event) =>
                setMarketingField("google_tag_manager_id", event.target.value)
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meta_pixel_id">Meta Pixel ID</Label>
            <Input
              id="meta_pixel_id"
              value={(form.marketing_config?.meta_pixel_id as string) ?? ""}
              onChange={(event) =>
                setMarketingField("meta_pixel_id", event.target.value)
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tiktok_pixel_id">TikTok Pixel ID</Label>
            <Input
              id="tiktok_pixel_id"
              value={(form.marketing_config?.tiktok_pixel_id as string) ?? ""}
              onChange={(event) =>
                setMarketingField("tiktok_pixel_id", event.target.value)
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newsletter_provider">Newsletter Provider</Label>
            <Input
              id="newsletter_provider"
              value={
                (form.marketing_config?.newsletter_provider as string) ?? ""
              }
              onChange={(event) =>
                setMarketingField("newsletter_provider", event.target.value)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {["instagram", "x", "facebook", "linkedin", "youtube", "tiktok"].map(
            (platform) => (
              <div className="grid gap-2" key={platform}>
                <Label htmlFor={`social_${platform}`}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Label>
                <Input
                  id={`social_${platform}`}
                  value={
                    (((form.marketing_config?.social_links as Record<
                      string,
                      unknown
                    >) ?? {})[platform] as string) ?? ""
                  }
                  onChange={(event) =>
                    setMarketingField("social_links", {
                      ...((form.marketing_config?.social_links as Record<
                        string,
                        unknown
                      >) ?? {}),
                      [platform]: event.target.value,
                    })
                  }
                />
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};
