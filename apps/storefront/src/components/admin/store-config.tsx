'use client'

import { useState, useEffect } from 'react'
import {
  Settings, CreditCard, Truck, Image as ImageIcon,
  Save, Loader2, ChevronDown, ChevronUp, Upload,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

import { getStoreConfig, saveStoreConfig } from '@/app/(admin)/admin/(panel)/store-config/api'
import { StoreConfigCreateInput, StoreConfigUpdateInput } from '@dtc/cms/db'

// ── Types ──────────────────────────────────────────────────────────
interface SeoConfig {
  default_title?: string
  title_template?: string
  default_description?: string
  default_image_url?: string
  canonical_url?: string
  robots?: { index?: boolean; follow?: boolean }
  open_graph?: { site_name?: string; type?: string }
  twitter?: { card?: string }
}

interface SocialLinks {
  instagram?: string
  x?: string
  facebook?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
}

interface MarketingConfig {
  google_analytics_id?: string
  google_tag_manager_id?: string
  meta_pixel_id?: string
  tiktok_pixel_id?: string
  social_links?: SocialLinks
}

interface StoreConfigForm {
  id?: string
  medusaStoreId?: string
  title: string
  handle: string
  domain: string
  description: string
  logoUrl: string
  logoAlt: string
  faviconUrl: string
  seoConfig: SeoConfig
  marketingConfig: MarketingConfig
  config: Record<string, unknown>
}

// ── Constants ──────────────────────────────────────────────────────
const SOCIAL_PLATFORMS = ['instagram', 'x', 'facebook', 'linkedin', 'youtube', 'tiktok'] as const

const empty: StoreConfigForm = {
  medusaStoreId: '',
  title: '',
  handle: '',
  domain: '',
  description: '',
  logoUrl: '',
  logoAlt: '',
  faviconUrl: '',
  seoConfig: {},
  marketingConfig: {},
  config: {},
}

// ── Field helper ───────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────
export default function StoreConfig({ storeId }: { storeId: string }) {
  const [form, setForm] = useState<StoreConfigForm>(empty)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Helpers ──
  const set = <K extends keyof StoreConfigForm>(key: K, value: StoreConfigForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setSeo = <K extends keyof SeoConfig>(key: K, value: SeoConfig[K]) =>
    setForm((f) => ({
      ...f,
      seoConfig: { ...((f.seoConfig as SeoConfig) || {}), [key]: value },
    }))

  const setMarketing = <K extends keyof MarketingConfig>(key: K, value: MarketingConfig[K]) =>
    setForm((f) => ({ ...f, marketingConfig: { ...f.marketingConfig, [key]: value } }))

  const setSocial = (platform: keyof SocialLinks, value: string) =>
    setForm((f) => ({
      ...f,
      marketingConfig: {
        ...f.marketingConfig,
        social_links: { ...f.marketingConfig.social_links, [platform]: value },
      },
    }))

  const setRobots = (key: 'index' | 'follow', value: boolean) =>
    setSeo('robots', { ...((form.seoConfig && form.seoConfig.robots) || {}), [key]: value })

  // ── Load ──
  useEffect(() => {
    getStoreConfig()
      .then((data) => { if (data) setForm(data) })
      .catch(() => toast.error('Failed to load store config'))
      .finally(() => setIsLoading(false))
  }, [])

  // ── Upload ──
  const uploadFile = async (file: File): Promise<string> => {
    const body = new FormData()
    body.append('files', file, file.name)
    const res = await fetch('/api/uploads', { method: 'POST', body, credentials: 'include' })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.files[0]?.url
  }

  // ── Submit ──
  const submit = async () => {
    setError(null)

    if (!form.title?.trim()) return setError('Store title is required.')
    if (!form.handle?.trim()) return setError('Handle is required.')
    if (!form.domain?.trim()) return setError('Domain is required.')

    setIsSaving(true)
    try {
      // Ensure nested configs are JSON-serializable to satisfy saveStoreConfig types
      const payload = {
        ...form,
        medusaStoreId: storeId,
        // serialize nested configs to plain JSON-compatible values
        seoConfig: form.seoConfig ? JSON.parse(JSON.stringify(form.seoConfig)) : undefined,
        marketingConfig: form.marketingConfig ? JSON.parse(JSON.stringify(form.marketingConfig)) : undefined,
      } as unknown as StoreConfigCreateInput | StoreConfigUpdateInput
      const saved = await saveStoreConfig(payload)
      if (saved) setForm(saved)
      toast.success('Store config saved.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save.'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5" />
          <div>
            <h1 className="text-xl font-semibold">Store Config</h1>
            <p className="text-sm text-muted-foreground">Manage your storefront settings</p>
          </div>
        </div>
        <Badge variant={form.id ? 'default' : 'secondary'}>
          {form.id ? 'Saved' : 'New'}
        </Badge>
      </div>

      {/* Quick links */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/store-config/payment-configs">
            <CreditCard className="mr-2 h-4 w-4" /> Payment Configs
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/store-config/shipping-method-configs">
            <Truck className="mr-2 h-4 w-4" /> Shipping Methods
          </Link>
        </Button>
      </div>

      {/* Basic Info */}
      <Card className="flex flex-col gap-4 p-6">
        <div>
          <h2 className="font-semibold text-base">Basic Information</h2>
          <p className="text-sm text-muted-foreground">Core identity of your store</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Store Title *">
            <Input
              placeholder="My Awesome Store"
              value={form.title ?? ''}
              onChange={(e) => set('title', e.target.value)}
            />
          </Field>
          <Field label="Handle *">
            <Input
              placeholder="my-store"
              value={form.handle ?? ''}
              onChange={(e) => set('handle', e.target.value)}
            />
          </Field>
          <Field label="Domain *">
            <Input
              placeholder="https://example.com"
              value={form.domain ?? ''}
              onChange={(e) => set('domain', e.target.value)}
            />
          </Field>
          <Field label="Description">
            <Textarea
              placeholder="A short description of your store..."
              rows={3}
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              className="sm:col-span-2"
            />
          </Field>
        </div>
      </Card>

      {/* Brand Assets */}
      <Card className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <div>
            <h2 className="font-semibold text-base">Brand Assets</h2>
            <p className="text-sm text-muted-foreground">Logo and favicon</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo */}
          <div className="flex flex-col gap-3">
            <Field label="Logo URL">
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={form.logoUrl ?? ''}
                  onChange={(e) => set('logoUrl', e.target.value)}
                />
                <Button variant="outline" size="sm" type="button" asChild>
                  <label htmlFor="logo_upload" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                  </label>
                </Button>
                <input
                  id="logo_upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const url = await uploadFile(file)
                      set('logoUrl', url)
                      toast.success('Logo uploaded')
                    } catch { toast.error('Upload failed') }
                    finally { e.target.value = '' }
                  }}
                />
              </div>
            </Field>
            <Field label="Logo Alt Text">
              <Input
                placeholder="Store logo"
                value={form.logoAlt ?? ''}
                onChange={(e) => set('logoAlt', e.target.value)}
              />
            </Field>
            {form.logoUrl && (
              <div className="border rounded-md p-4 bg-muted/30">
                <img
                  src={form.logoUrl}
                  alt="Logo preview"
                  className="max-h-16 object-contain"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              </div>
            )}
          </div>

          {/* Favicon */}
          <div className="flex flex-col gap-3">
            <Field label="Favicon URL">
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={form.faviconUrl ?? ''}
                  onChange={(e) => set('faviconUrl', e.target.value)}
                />
                <Button variant="outline" size="sm" type="button" asChild>
                  <label htmlFor="favicon_upload" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                  </label>
                </Button>
                <input
                  id="favicon_upload"
                  type="file"
                  accept="image/*,.ico"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const url = await uploadFile(file)
                      set('faviconUrl', url)
                      toast.success('Favicon uploaded')
                    } catch { toast.error('Upload failed') }
                    finally { e.target.value = '' }
                  }}
                />
              </div>
            </Field>
            {form.faviconUrl && (
              <div className="border rounded-md p-4 bg-muted/30 flex justify-center">
                <img
                  src={form.faviconUrl}
                  alt="Favicon preview"
                  className="h-10 w-10 object-contain"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* SEO */}
      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="font-semibold text-base">SEO</h2>
          <p className="text-sm text-muted-foreground">Search engine optimization settings</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Default Title">
            <Input
              placeholder="My Store"
              value={form.seoConfig?.default_title ?? ''}
              onChange={(e) => setSeo('default_title', e.target.value)}
            />
          </Field>
          <Field label="Title Template">
            <Input
              placeholder="%s | My Store"
              value={form.seoConfig?.title_template ?? ''}
              onChange={(e) => setSeo('title_template', e.target.value)}
            />
          </Field>
          <Field label="Default Description">
            <Textarea
              rows={3}
              value={form.seoConfig?.default_description ?? ''}
              onChange={(e) => setSeo('default_description', e.target.value)}
              className="sm:col-span-2"
            />
          </Field>
          <Field label="Default Image URL">
            <Input
              value={form.seoConfig?.default_image_url ?? ''}
              onChange={(e) => setSeo('default_image_url', e.target.value)}
            />
          </Field>
          <Field label="Canonical URL">
            <Input
              value={form.seoConfig?.canonical_url ?? ''}
              onChange={(e) => setSeo('canonical_url', e.target.value)}
            />
          </Field>
        </div>

        <div>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Robots
          </span>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={!!form.seoConfig?.robots?.index}
                onCheckedChange={(v) => setRobots('index', !!v)}
              />
              Index
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={!!form.seoConfig?.robots?.follow}
                onCheckedChange={(v) => setRobots('follow', !!v)}
              />
              Follow
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="OG Site Name">
            <Input
              value={form.seoConfig?.open_graph?.site_name ?? ''}
              onChange={(e) =>
                setSeo('open_graph', { ...form.seoConfig?.open_graph, site_name: e.target.value })
              }
            />
          </Field>
          <Field label="OG Type">
            <Input
              placeholder="website"
              value={form.seoConfig?.open_graph?.type ?? ''}
              onChange={(e) =>
                setSeo('open_graph', { ...form.seoConfig?.open_graph, type: e.target.value })
              }
            />
          </Field>
          <Field label="Twitter Card">
            <Input
              placeholder="summary_large_image"
              value={form.seoConfig?.twitter?.card ?? ''}
              onChange={(e) =>
                setSeo('twitter', { ...form.seoConfig?.twitter, card: e.target.value })
              }
            />
          </Field>
        </div>
      </Card>

      {/* Marketing */}
      <Card className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="font-semibold text-base">Marketing</h2>
          <p className="text-sm text-muted-foreground">Analytics, pixels, and social links</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Google Analytics ID">
            <Input
              placeholder="G-XXXXXXXXXX"
              value={form.marketingConfig?.google_analytics_id ?? ''}
              onChange={(e) => setMarketing('google_analytics_id', e.target.value)}
            />
          </Field>
          <Field label="Google Tag Manager ID">
            <Input
              placeholder="GTM-XXXXXX"
              value={form.marketingConfig?.google_tag_manager_id ?? ''}
              onChange={(e) => setMarketing('google_tag_manager_id', e.target.value)}
            />
          </Field>
          <Field label="Meta Pixel ID">
            <Input
              value={form.marketingConfig?.meta_pixel_id ?? ''}
              onChange={(e) => setMarketing('meta_pixel_id', e.target.value)}
            />
          </Field>
          <Field label="TikTok Pixel ID">
            <Input
              value={form.marketingConfig?.tiktok_pixel_id ?? ''}
              onChange={(e) => setMarketing('tiktok_pixel_id', e.target.value)}
            />
          </Field>
        </div>

        <div>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Social Links
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {SOCIAL_PLATFORMS.map((platform) => (
              <Field key={platform} label={platform}>
                <Input
                  placeholder={`https://.../${platform}`}
                  value={form.marketingConfig?.social_links?.[platform] ?? ''}
                  onChange={(e) => setSocial(platform, e.target.value)}
                />
              </Field>
            ))}
          </div>
        </div>
      </Card>

      {/* Advanced */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-base">Advanced</h2>
            <p className="text-sm text-muted-foreground">Raw JSON config</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {showAdvanced ? 'Hide' : 'Show'}
          </Button>
        </div>

        {showAdvanced && (
          <Field label="General Config (JSON)">
            <Textarea
              className="font-mono text-sm"
              rows={8}
              value={JSON.stringify(form.config, null, 2)}
              onChange={(e) => {
                try { set('config', JSON.parse(e.target.value)) } catch { /* let user finish typing */ }
              }}
            />
          </Field>
        )}
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button type="button" onClick={submit} disabled={isSaving}>
          {isSaving
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            : <><Save className="mr-2 h-4 w-4" /> Save Config</>}
        </Button>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>

    </div>
  )
}