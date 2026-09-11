import { useState } from "react";
import { WithLayout, withLayout } from "../../blocks/layout";
import {
  sectionFields,
  type SectionStyleProps,
} from "../../config/sectionFields";
import { ComponentConfig } from "@puckeditor/core";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

interface FAQ {
  title: string;
  answer: string;
}

export type FaqSectionProps = WithLayout<
  SectionStyleProps & {
    faqs?: FAQ[];
  }
>;

const FAQSectionInner: ComponentConfig<FaqSectionProps> = {
  label: "سوالات متداول",
  fields: {
    faqs: {
      type: "array",
      label: "سوالات",
      getItemSummary: (item: { title?: string }) => item?.title || "سوال جدید",
      arrayFields: {
        title: {
          type: "text",
          label: "عنوان",
        },
        answer: {
          type: "textarea",
          label: "جواب",
        },
      },
      defaultItemProps: {
        title: "متن سوال",
        answer: "جواب را در اینجا وارد بفرمایید",
      },
    },
    ...sectionFields,
  },
  defaultProps: {
    faqs: [
      {
        title: "ارسال چقدر طول می‌کشد؟",
        answer:
          "ارسال استاندارد معمولاً ۵ تا ۷ روز کاری طول می‌کشد. ارسال سریع در مرحله پرداخت قابل انتخاب است و ظرف ۲ تا ۳ روز کاری تحویل داده می‌شود.",
      },
      {
        title: "سیاست بازگشت کالای شما چیست؟",
        answer:
          "ما برای همه کالاها سیاست بازگشت ۳۰ روزه ارائه می‌دهیم. محصولات باید در وضعیت اصلی خود و با برچسب‌های متصل باشند. برای جزئیات بیشتر به صفحه بازگشت کالا مراجعه کنید.",
      },
      {
        title: "آیا به خارج از کشور ارسال می‌کنید؟",
        answer:
          "بله، ما به بیشتر کشورهای جهان ارسال می‌کنیم. هزینه‌ها و زمان‌های تحویل ارسال بین‌المللی بسته به مقصد متفاوت است. هزینه دقیق را می‌توانید در مرحله پرداخت ببینید.",
      },
      {
        title: "چگونه می‌توانم سفارشم را پیگیری کنم؟",
        answer:
          "پس از ارسال سفارش، یک ایمیل تأیید همراه با شماره پیگیری دریافت خواهید کرد. همچنین می‌توانید سفارش خود را از داشبورد حساب کاربری‌تان پیگیری کنید.",
      },
      {
        title: "چه روش‌های پرداختی را می‌پذیرید؟",
        answer:
          "ما همه کارت‌های اعتباری اصلی (ویزا، مسترکارت، امریکن اکسپرس)، پی‌پال و اپل پی را می‌پذیریم. همه تراکنش‌ها با رمزنگاری SSL ایمن می‌شوند.",
      },
      {
        title: "چگونه با پشتیبانی مشتریان تماس بگیرم؟",
        answer:
          "می‌توانید از طریق صفحه تماس با ما با ما در ارتباط باشید، به support@store.com ایمیل بزنید، یا با شماره (۵۵۵) ۱۲۳-۴۵۶۷ تماس بگیرید. تیم پشتیبانی ما از دوشنبه تا جمعه، ساعت ۹ صبح تا ۵ عصر به وقت EST در دسترس است.",
      },
      {
        title: "آیا می‌توانم سفارشم را تغییر دهم یا لغو کنم؟",
        answer:
          "می‌توانید سفارش خود را ظرف ۱ ساعت پس از ثبت تغییر دهید یا لغو کنید. پس از آن، لطفاً با تیم پشتیبانی ما تماس بگیرید و ما تمام تلاش خود را برای رسیدگی به درخواست شما انجام خواهیم داد.",
      },
      {
        title: "آیا کارت هدیه ارائه می‌دهید؟",
        answer:
          "بله! کارت‌های هدیه دیجیتال در مقادیر ۲۵، ۵۰، ۱۰۰ و ۲۰۰ دلار موجود هستند. آن‌ها بلافاصله از طریق ایمیل تحویل داده می‌شوند و هرگز منقضی نمی‌شوند.",
      },
    ],
  },
  render: ({ faqs, sectionStyle }: FaqSectionProps) => {
    const [activeTabId, setActiveTabId] = useState<number>(0);

    const backgroundColor =
      sectionStyle?.backgroundColor === "custom"
        ? sectionStyle?.backgroundColorCustom
        : sectionStyle?.backgroundColor;

    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">
          سوالات پرتکرار
        </h1>
        <p className="mt-4 text-muted-foreground">
          جواب سوالات خود را در مورد محصولات، ارسال و سیاست‌های ما را پیدا کنید.
        </p>

        <Accordion className="mt-8">
          {faqs?.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.title}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-lg border bg-neutral-50 p-6 text-center">
          <h2 className="text-lg font-semibold">سوالات بیشتری دارید؟</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            اگر نمی توانید جواب سوالتان رو پیدا کنید، تیم پشتیبانی ما خوشحال می
            شود که به شما کمک کند.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-medium underline hover:text-foreground"
          >
            با پشتیبانی تماس بگیرید
          </Link>
        </div>
      </div>
    );
  },
};

export const FAQSection: ComponentConfig<FaqSectionProps> =
  withLayout(FAQSectionInner);
