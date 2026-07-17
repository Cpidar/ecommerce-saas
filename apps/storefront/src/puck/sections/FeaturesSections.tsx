// configs/components/IntroSection.ts
import { ComponentConfig } from "@puckeditor/core";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { ReactElement } from "react";
import dynamic from "next/dynamic";

const icons = Object.keys(dynamicIconImports).reduce<
  Record<string, ReactElement>
>((acc, iconName) => {
  const El = dynamic((dynamicIconImports as any)[iconName]);

  return {
    ...acc,
    [iconName]: <El />,
  };
}, {});

const iconOptions = Object.keys(dynamicIconImports).map((iconName) => ({
  label: iconName,
  value: iconName,
}));

interface IntroSection {
  features: {
    icon: string;
    title: string;
    desc: string;
  }[];
}

export const FeaturesSection: ComponentConfig<IntroSection> = {
  label: "فیچرلیست سایت",
  defaultProps: {
    features: [
      {
        icon: "Truck",
        title: "ارسال رایگان",
        desc: "برای سفارش‌های بالای ۵۰۰ هزار تومان",
      },
      {
        icon: "Shield",
        title: "گارانتی اصالت",
        desc: "تمام محصولات دارای گارانتی اصالت",
      },
      {
        icon: "Headphones",
        title: "پشتیبانی ۲۴ ساعته",
        desc: "همیشه در خدمت شما هستیم",
      },
      {
        icon: "CreditCard",
        title: "پرداخت امن",
        desc: "پرداخت از طریق درگاه‌های بانکی معتبر",
      },
    ],
  },
  fields: {
    features: {
      type: "array",
      getItemSummary: (item, i) =>
        item.title && item.desc ? (
          <>
            {item.title} ({item.desc})
          </>
        ) : (
          `Feature #${i}`
        ),
      arrayFields: {
        title: {
          type: "text",
          contentEditable: true,
        },
        desc: {
          type: "text",
          contentEditable: true,
        },
        icon: {
          type: "select",
          options: iconOptions,
        },
      },
    },
  },

  render: ({ features }: IntroSection) => (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center"
          >
            {/* <motion.div
             key={feature.title}
             initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
             transition={{ delay: index * 0.1 }}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center"
          > */}
            <div className="w-9 h-9 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
              {/* <feature.icon size={18} className="sm:w-6 sm:h-6 text-primary" /> */}
              <div className="sm:w-6 sm:h-6 text-primary">
                {feature.icon && icons[feature.icon]}
              </div>
            </div>
            <h3 className="font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">
              {feature.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {feature.desc}
            </p>
            {/* </motion.div> */}
          </div>
        ))}
      </div>
    </section>
  ),
};
