export type JsonRecord = Record<string, unknown>;

/**
 * Input consumed from the `storeCreated` hook's `additional_data` plus the
 * store id emitted by the `createStoreWorkflow`.
 *
 * - `title` / `handle` / `subscription_id` / `subscription_status` are passed
 *   straight into the new StoreConfig row.
 * - `template` is an optional JSON template written into `puck_data`; when
 *   omitted a sensible default template is used as a fallback.
 */
export type InitializeStoreWorkflowInput = {
  storeId: string;
  title?: string;
  handle: string;
  subscription_id?: string | null;
  subscription_status?: string;
  template?: JsonRecord;
};
