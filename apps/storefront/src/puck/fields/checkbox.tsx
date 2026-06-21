"use client";

import { CustomField } from "@puckeditor/core";

export const checkboxField: CustomField<boolean> = {
  type: "custom",
  render: ({ field, value, onChange, name }) => (
    <div style={{ padding: "8px 0" }}>
      <input
        type="checkbox"
        id={name}
        checked={value === true}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={name} style={{ marginLeft: 8 }}>
        {field.label}
      </label>
    </div>
  ),
};
