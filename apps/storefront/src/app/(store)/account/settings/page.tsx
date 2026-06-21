"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function SettingsPage() {
  const tAccount = useTranslations("account")
  const tAuth = useTranslations("auth")
  const tCommon = useTranslations("common")
  const { customer, isReady } = useAuthGuard()
  const updateProfile = useAuthStore((s) => s.updateProfile)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name ?? "")
      setLastName(customer.last_name ?? "")
      setPhone(customer.phone ?? "")
    }
  }, [customer])

  if (!isReady || !customer) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      })
      toast.success(tAccount("profileUpdated"))
    } catch (err) {
      console.error(err)
      toast.error(tAccount("couldntUpdateProfile"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader title={tCommon("settings")} />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{tAccount("profileInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{tAuth("firstName")}</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{tAuth("lastName")}</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{tAuth("email")}</Label>
              <Input id="email" type="email" value={customer.email ?? ""} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                {tAccount("emailChangeUnavailable")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{tAccount("phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? tCommon("saving") : tCommon("saveChanges")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
