import { Card, CardContent } from "@/components/ui/card";
import { tryGetCurrentCustomer } from "@/lib/medusa/auth-server";
import { Smartphone } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "صفحه ورود",
  description: "به حساب کاربری خود وارد شوید.",
  robots: { index: false, follow: false },
};

export default async function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection(); // wait for an actual request
  const customer = await tryGetCurrentCustomer();

  if (customer) {
    redirect("/account");
  }
  return (
    <section className="h-screen flex items-center justify-center bg-no-repeat inset-0 bg-cover bg-[url('/images/bg.png')]">
      <div className="flex-1 sm:w-full sm:max-w-105 px-4">
        <Card>
          <CardContent className="">
            <div className="nc-PageLogin p-5 lg:mb-10 flex flex-col items-center lg:justify-center">
              <div className="w-full relative flex items-center justify-center">
                <div className="flex right-0 text-neutral-700 transition-all duration-300 ease-out cursor-pointer fixed lg:absolute">
                  {/* <ArrowRightIcon /> */}
                </div>
                <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-secondary">
                  <Smartphone size={36} />
                </span>
              </div>
              {children}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
