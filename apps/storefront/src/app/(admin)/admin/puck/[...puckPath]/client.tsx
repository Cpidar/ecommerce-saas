"use client";

import config from "@/puck/config";
import type { Config, Data } from "@puckeditor/core";
import {
  AutoField,
  Button,
  createUsePuck,
  FieldLabel,
  Puck,
} from "@puckeditor/core";
import { Globe, Type } from "lucide-react";
import { toast } from "sonner";

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

  const params = new URL(window.location.href).searchParams;

  return (
    <Puck
      config={config}
      data={data}
      // onPublish={async (data) => {
      // }}
      headerPath={path}
      iframe={{
        enabled: params.get("disableIframe") === "true" ? false : true,
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
                    await fetch(`/api/puck`, {
                      method: "post",
                      body: JSON.stringify({ data, path }),
                    });
                    toast.info("اطلاعات با موفقیت ذخیره شد", {
                      position: "top-center",
                      closeButton: true,
                    });
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
