import { NextRequestHandler } from "@zenstackhq/server/next";
import { RPCApiHandler } from "@zenstackhq/server/api";
import { schema } from "@dtc/cms/schema";
import { getDbFromRequest } from "@dtc/cms/db";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

const handler = NextRequestHandler({
  apiHandler: new RPCApiHandler({ schema }),
  getClient: (req: NextRequest) => {
    const cookieStore = req.cookies;
    const storeId = cookieStore.get("current_store_id")?.value;
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token || !storeId) throw new Error("Unauthorized");

    return getDbFromRequest(storeId, token);
  },
  useAppDir: true,
});

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
