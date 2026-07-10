"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Mail, Globe, GitFork } from "lucide-react"
import { toast } from "sonner"
import { contactFormSchema } from "@/lib/validators"

export default function ContactPage() {
  const tContact = useTranslations("contact")
  const tCommon = useTranslations("common")

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = contactFormSchema.safeParse(form)
    if (!result.success) {
      const issue = result.error.issues[0]
      const message =
        issue.path[0] === "message"
          ? tContact("messageMinLength")
          : tContact("fillAllFields")

      toast.error(message)
      return
    }

    setLoading(true)
    // In production, send to support@epicdesignlabs.com via API route or form service
    setTimeout(() => {
      toast.success(tContact("messageSent"))
      setForm({ name: "", email: "", subject: "", message: "" })
      setLoading(false)
    }, 500)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title={tContact("title")}
        description={tContact("description")}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Contact info cards */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                {tContact("email")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@epicdesignlabs.com"
                className="text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                support@epicdesignlabs.com
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" />
                {tContact("website")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="https://epicdesignlabs.com"
                target="_blank"
                rel="noopener"
                className="text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                epicdesignlabs.com
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <GitFork className="h-4 w-4" />
                {tContact("github")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter"
                target="_blank"
                rel="noopener"
                className="text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                {tContact("viewOnGithub")}
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Contact form */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{tContact("name")}</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={tContact("yourName")}
                    value={form.name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{tContact("email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={tContact("emailPlaceholder")}
                    value={form.email}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">{tContact("subject")}</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder={tContact("subjectPlaceholder")}
                  value={form.subject}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{tContact("message")}</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={tContact("messagePlaceholder")}
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                {loading ? tCommon("sending") : tCommon("sendMessage")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
