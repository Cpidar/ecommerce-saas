import { defineMiddlewares, MiddlewareRoute } from "@medusajs/framework/http"
import multer from "multer"
import { addStoreScope } from "../../middlewares/add-store-scope"

const upload = multer({ storage: multer.memoryStorage() })

export const adminCustomUploadsRoutesMiddlewares: MiddlewareRoute[] = [
    {
        method: ["POST"],
        matcher: "/admin/uploads",
        middlewares: [addStoreScope],
    },
]
