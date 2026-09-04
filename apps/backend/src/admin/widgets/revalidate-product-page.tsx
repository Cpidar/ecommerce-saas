import { Button, Container, Heading, Text, toast } from "@medusajs/ui";
import { ImageSparkle } from "@medusajs/icons";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import { revalidate } from "../../utils/revalidate";
import { MedusaContainer } from "@medusajs/framework";
import { useMutation } from "@tanstack/react-query";

export const config = defineWidgetConfig({
  zone: "product.details.side",
});

const ProductRevalidateWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const revalidateFunc = useMutation({
    mutationFn: async () => {
      const result = await revalidate(
        {} as MedusaContainer,
        "products",
        {
          type: "manual",
          handle: data.handle,
          id: data.id,
          affects_grid: true,
        },
        {
          revalidationEndpoint:
            import.meta.env.VITE_STOREFRONT_REVALIDATION_URL ?? "",
          revalidationSecret: import.meta.env.VITE_MEDUSA_WEBHOOK_SECRET ?? "",
        },
      );
      return result;
    },
    onSuccess: () => {
      toast.success("تغییرات با موفقیت اعمال شد.");
    },
    onError: (error) => {
      toast.error("خطا در اعمال تغییرات. لطفاً دوباره تلاش کنید.");
      console.error("Failed to revalidate:", error);
    },
  });

  const handleRevalidate = () => revalidateFunc.mutate();

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">به‌روزرسانی فروشگاه</Heading>
          <Button
            size="small"
            variant="secondary"
            isLoading={revalidateFunc.isPending}
            onClick={handleRevalidate}
          >
            <ImageSparkle className="mr-1" />
            همگام‌سازی
          </Button>
        </div>
        <div className="px-6 py-3">
          <Text size="small" className="text-ui-fg-subtle">
            تغییرات اعمال‌شده در این دسته‌بندی را بلافاصله در فروشگاه نمایش
            دهید.
          </Text>
        </div>
      </Container>
    </>
  );
};

export default ProductRevalidateWidget;
