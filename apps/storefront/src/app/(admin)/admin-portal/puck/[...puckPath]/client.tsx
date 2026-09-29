"use client";

import { savePuckData } from "@/lib/medusa/stores-actions";
import config from "@/puck/config";
import type { Config, Data } from "@puckeditor/core";
import {
  AutoField,
  Button,
  createUsePuck,
  FieldLabel,
  Puck,
} from "@puckeditor/core";
import { Type } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuthGuard } from "@/hooks/use-admin-auth-guard";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

const usePuck = createUsePuck<Config>();

export function Client({
  path,
  data,
  countryCode,
}: {
  path: string;
  data: Partial<Data>;
  countryCode: string;
}) {
  const metadata = {
    example: "Hello, world",
  };

  const params = useSearchParams();
  const redirectTo =
    process.env.NODE_ENV === "production"
      ? "/app/login"
      : "http://localhost:9000/app/login";
  const { isReady } = useAdminAuthGuard(redirectTo);

  if (!isReady) {
    return editPageLoading();
  }
  return (
    <Puck
      config={config}
      data={data}
      // onPublish={async (data) => {
      // }}
      headerPath={path}
      iframe={{
        enabled: params?.get("disableIframe") === "true" ? false : true,
      }}
      fieldTransforms={{
        userField: ({ value }) => value, // Included to check types
      }}
      _experimentalVirtualization
      overrides={{
        fieldTypes: {
          // Example of user field provided via overrides
          userField: ({ readOnly, field, name, value, onChange }) => (
            <FieldLabel
              label={field.label || name}
              readOnly={readOnly}
              icon={<Type size={16} />}
            >
              <AutoField
                field={{ type: "text" }}
                onChange={onChange}
                value={value}
              />
            </FieldLabel>
          ),
        },
        headerActions: ({ children }) => {
          const data = usePuck((s) => s.appState.data);
          console.log("Size in bytes:", JSON.stringify(data).length);

          return (
            <>
              <div>
                <Button
                  href={path === "/home" ? "/" : path}
                  newTab
                  variant="secondary"
                >
                  مشاهده سایت
                </Button>
              </div>
              <div>
                <Button
                  onClick={async () => {
                    try {
                      await savePuckData({ data, path });
                      toast.info("اطلاعات با موفقیت ذخیره شد", {
                        position: "top-center",
                        closeButton: true,
                      });
                    } catch (e) {
                      console.error(e);
                      toast.error("خطای رخ داده است.", {
                        position: "top-center",
                        closeButton: true,
                      });
                    }
                  }}
                >
                  ذخیره و انتشار
                </Button>
              </div>

              {/* {children} */}
            </>
          );
        },
      }}
      metadata={metadata}
    />
  );
}

function editPageLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <Empty className="w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>در حال پردازش سفارش شما</EmptyTitle>
            <EmptyDescription>
              لطفا منتظر بمانید تا درخواست شما پردازش شود. صفحه را رفرش نکنید.
            </EmptyDescription>
          </EmptyHeader>
          {/* <EmptyContent>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </EmptyContent> */}
        </Empty>
      </div>
    </div>
  );
}
