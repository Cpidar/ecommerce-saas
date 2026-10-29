"use client";

import { useForm } from "@tanstack/react-form";
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  toast,
} from "@medusajs/ui";
import {
  useSaveStoreConfig,
  useStoreConfig,
} from "../../routes/store-config/hooks";
import { getErrorMessage } from "../../routes/store-config/errors";

/* -------------------------------------------------------------------------- */
/* Integration definitions: add a new integration by adding an entry here     */
/* -------------------------------------------------------------------------- */

type FieldDef = {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "password";
  className?: string; // full Tailwind class so it isn't purged
};

type IntegrationDef = {
  name: string;
  title: string;
  description: string;
  gridClassName: string;
  fields: FieldDef[];
};

const INTEGRATIONS: IntegrationDef[] = [
  {
    name: "torob",
    title: "Torob (ترب)",
    description: "Price comparison marketplace integration",
    gridClassName: "md:grid-cols-2",
    fields: [
      { key: "shop_id", label: "Shop ID", placeholder: "Torob Shop ID" },
      {
        key: "token",
        label: "API Token / JWT",
        placeholder: "Torob API Token",
        type: "password",
      },
      {
        key: "feed_url",
        label: "Product Feed URL (optional)",
        placeholder: "https://yourstore.com/torob-feed.xml",
        className: "md:col-span-2",
      },
    ],
  },
  {
    name: "pishro",
    title: "Pishro Accounting (حسابداری پیشرو)",
    description: "Accounting system integration",
    gridClassName: "md:grid-cols-3",
    fields: [
      {
        key: "apiUrl",
        label: "API URL",
        placeholder: "https://api.pishro.example.com",
        className: "md:col-span-3",
      },
      { key: "username", label: "Username", placeholder: "Username" },
      { key: "appcode", label: "App Code", placeholder: "App Code" },
      {
        key: "password",
        label: "Password",
        placeholder: "Password",
        type: "password",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Form setup                                                                 */
/* -------------------------------------------------------------------------- */

type ConfigValues = Record<string, Record<string, string | boolean>>;

function useConfigForm(
  defaultValues: ConfigValues,
  save: (values: ConfigValues) => Promise<void>,
) {
  return useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      await save(value);
      formApi.reset(value); // mark as pristine after a successful save
    },
  });
}
type ConfigForm = ReturnType<typeof useConfigForm>;

const buildDefaults = (saved: Record<string, any> = {}): ConfigValues =>
  Object.fromEntries(
    INTEGRATIONS.map(({ name, fields }) => [
      name,
      {
        enabled: false,
        ...Object.fromEntries(fields.map((f) => [f.key, ""])),
        ...(saved[name] ?? {}),
      },
    ]),
  );

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

export const IntegrationTab = () => {
  const { data: storeConfig, isLoading, isError } = useStoreConfig();

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !storeConfig) return <ErrorState />;

  // Mounted only once data exists, so defaultValues is correct from the start
  return <IntegrationForm storeConfig={storeConfig} />;
};

const IntegrationForm = ({ storeConfig }: { storeConfig: any }) => {
  const saveMutation = useSaveStoreConfig();

  const form = useConfigForm(buildDefaults(storeConfig.config), async (values) => {
    try {
      await saveMutation.mutateAsync({
        id: storeConfig.id,
        // keep any config keys this tab doesn't manage
        config: { ...(storeConfig.config ?? {}), ...values },
      } as any);
      toast.success("تنظیمات ذخیره شد");
    } catch (error) {
      toast.error(`خطا در ذخیره: ${getErrorMessage(error)}`);
    }
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      {INTEGRATIONS.map((integration) => (
        <IntegrationCard key={integration.name} form={form} {...integration} />
      ))}
    </form>
  );
};

const IntegrationCard = ({
  form,
  name,
  title,
  description,
  gridClassName,
  fields,
}: IntegrationDef & { form: ConfigForm }) => (
  <Container className="p-6">
    <div className="mb-6 flex items-center justify-between border-b border-ui-border-base pb-4">
      <div>
        <Heading level="h2">{title}</Heading>
        <Text size="small" className="mt-1 text-ui-fg-subtle">
          {description}
        </Text>
      </div>

      <form.Field name={`${name}.enabled`}>
        {(field) => (
          <div className="flex items-center gap-3">
            <Label htmlFor={`${name}_enabled`} className="cursor-pointer select-none">
              <Badge color={field.state.value ? "green" : "red"}>
                {field.state.value ? "Active" : "Inactive"}
              </Badge>
            </Label>
            <Switch
              id={`${name}_enabled`}
              checked={!!field.state.value}
              onCheckedChange={(checked) => field.handleChange(!!checked)}
            />
          </div>
        )}
      </form.Field>
    </div>

    {/* Subscribe once to `enabled` so all inputs disable together */}
    <form.Subscribe selector={(s) => !!s.values[name]?.enabled}>
      {(enabled) => (
        <div className={`grid grid-cols-1 gap-6 ${gridClassName}`}>
          {fields.map((f) => (
            <form.Field key={f.key} name={`${name}.${f.key}`}>
              {(field) => (
                <div className={`grid gap-2 ${f.className ?? ""}`}>
                  <Label htmlFor={`${name}_${f.key}`}>{f.label}</Label>
                  <Input
                    id={`${name}_${f.key}`}
                    type={f.type ?? "text"}
                    value={(field.state.value as string) ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={f.placeholder}
                    disabled={!enabled}
                  />
                </div>
              )}
            </form.Field>
          ))}
        </div>
      )}
    </form.Subscribe>

    <div className="mt-8 flex justify-end">
      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" size="large" isLoading={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        )}
      </form.Subscribe>
    </div>
  </Container>
);

const LoadingSkeleton = () => (
  <Container className="p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 rounded bg-ui-bg-base-hover" />
      <div className="h-4 w-64 rounded bg-ui-bg-base-hover" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-10 rounded bg-ui-bg-base-hover" />
        <div className="h-10 rounded bg-ui-bg-base-hover" />
      </div>
    </div>
  </Container>
);

const ErrorState = () => (
  <Container className="flex flex-col items-center justify-center py-12">
    <Heading level="h2">خطا در دریافت تنظیمات</Heading>
    <Text className="mt-2 text-ui-fg-subtle">
      لطفا صفحه را مجدداً بارگذاری کنید
    </Text>
    <Button
      className="mt-4"
      variant="secondary"
      onClick={() => window.location.reload()}
    >
      بارگذاری مجدد
    </Button>
  </Container>
);
