// puck.config.tsx

import { Config } from "@puckeditor/core";
import { Space } from "./blocks/Space";

// Define the root categories for better organization in the editor
export const config: Config = {
  components: {
    Space,
  },

  // Optional: Define root component (what wraps the page)
  root: {
    fields: {
      desc: { type: "text" },
    },
    render: ({ children }: { children: React.ReactNode }) => {
      return <>{children}</>;
    },
  },
};

export default config;
