// app/(admin)/admin/login/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import { loginSchema } from "@/lib/validators";
import { loginAdmin } from "@/lib/medusa/admin-auth";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const params = await searchParams;
  const from = params?.from ?? "/admin";
  const error = params?.error;

  async function handleLogin(formData: FormData) {
    "use server";
    
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      redirect(`/admin/login?error=${encodeURIComponent(result.error.issues[0].message)}`);
    }
    
    try {
      await loginAdmin(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid email or password";
      redirect(`/admin/login?error=${encodeURIComponent(message)}`);
    }
    
    redirect(from);
  }

  return (
    <AuthCardLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/auth/register"
    >
      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
          {decodeURIComponent(error)}
        </div>
      )}
      
      <form action={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue="admin@medusa.local"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            defaultValue="supersecret"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </AuthCardLayout>
  );
}