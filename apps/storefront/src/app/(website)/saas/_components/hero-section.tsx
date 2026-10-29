import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { AnimatedHeroHeading } from "./animated-hero-heading";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

export function HeroSection() {
  return (
    <section className="mx-auto flex flex-col items-center gap-6 bg-linear-to-b from-background from-40% via-primary/10 to-background px-4 py-20 text-center sm:from-10% 2xl:pt-60">
      <AnimatedHeroHeading />

      <p className="max-w-3xl pb-2 text-lg leading-7 text-pretty text-muted-foreground sm:text-xl sm:leading-8">
        فروشگاه اینترنتی خودت رو بساز، محصولاتت رو مدیریت کن و فروش آنلاین
        کسب‌وکارت رو شروع کن؛ همه‌چیز ساده، یکپارچه و در اختیار خودته.
      </p>

      <div className="flex-col items-center gap-4 pb-4" dir="ltr">
        <div className="flex w-full max-w-md flex-col gap-3 pt-4 sm:flex-row">
          {/*<InputGroup className="h-10">
            <InputGroupInput
              placeholder="آیدی فروشگاه شما"
              dir="rtl"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>.s5arc.store</InputGroupText>
            </InputGroupAddon>
          </InputGroup>*/}

          <Button size="lg">همین الان فروشگاهتو بساز</Button>
        </div>

        <div
          className="flex w-full items-center justify-center gap-2 pt-4 text-center text-sm text-muted-foreground"
          dir="rtl"
        >
          <i
            className="h-4 w-4 text-foreground"
            data-feather="check"
          />
          راه‌اندازی آسان، بدون نیاز به دانش فنی
        </div>
      </div>

      <div className="relative mt-8 aspect-video w-full max-w-6xl overflow-hidden rounded-xl shadow-xs 2xl:mt-20 2xl:max-w-[1600px]">
        <Image
          src="/Screenshot_2025-02-14_at_1.01.35_PM_ecyltl.webp"
          alt="پیش‌نمایش پنل مدیریت فروشگاه اینترنتی"
          priority
          fill
          className="object-contain object-top"
        />

        <div className="absolute right-0 bottom-0 left-0 h-2/3 bg-linear-to-t from-white to-transparent" />
      </div>
    </section>
  );
}
