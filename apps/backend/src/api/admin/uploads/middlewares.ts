import { defineMiddlewares, MiddlewareRoute } from "@medusajs/framework/http"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

export const adminCustomUploadsRoutesMiddlewares: MiddlewareRoute[] = [
    // {
    //     method: ["POST"],
    //     matcher: "/admin/uploads",
    //     middlewares: [
    //         // @ts-ignore
    //         upload.array("files"),
    //     ],
    // },
]
