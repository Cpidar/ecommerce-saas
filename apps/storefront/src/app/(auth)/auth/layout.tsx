import { Metadata } from "next"

export const metadata: Metadata = {
  title: "صفحه ورود",
  description: "به حساب کاربری خود وارد شوید.",
  robots: { index: false, follow: false },
}

export default async function PageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="h-screen flex items-center justify-center bg-no-repeat inset-0 bg-cover bg-[url('/images/bg.png')]">
      <div className="flex-1 sm:w-full sm:max-w-105">
        <div
          className="bg-background rounded-lg p-5 border border-neutral-200"
          style={{ boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}
