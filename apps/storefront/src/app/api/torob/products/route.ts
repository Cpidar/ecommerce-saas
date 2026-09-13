// app/api/torob/products/route.ts

import { NextRequest, NextResponse } from "next/server"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@/lib/medusa"
// import { verifyTorobToken } from "@/lib/torob-jwt"

const PAGE_SIZE = 100 // Torob requires exactly 100 products per page (except last page)

export async function POST(req: NextRequest) {
    try {
        // Dynamically get the site URL from the request host
        const host = req.headers.get("host") || req.nextUrl.host
        const protocol = req.headers.get("x-forwarded-proto") || "https"
        const SITE_URL = `${protocol}://${host}`

        // 2. Get the token from headers
        const token = req.headers.get("x-torob-token")
        const tokenVersion = req.headers.get("x-torob-token-version")

        // 3. Validate token presence and version
        if (!token || tokenVersion !== "1") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 4. Verify the JWT signature + audience + expiration
        // const isValid = await verifyTorobToken(token, host)

        // if (!isValid) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        // }

        const body = await req.json()

        // --- Handle different request types from Torob ---
        const { page, sort, page_urls, page_uniques } = body

        // Case 1: Request by specific product URLs
        if (page_urls && Array.isArray(page_urls) && page_urls.length > 0) {
            return await handleByUrls(page_urls, SITE_URL)
        }

        // Case 2: Request by unique IDs
        if (page_uniques && Array.isArray(page_uniques) && page_uniques.length > 0) {
            return await handleByUniques(page_uniques, SITE_URL)
        }

        // Case 3: Paginated list (most common)
        if (typeof page === "number" && sort) {
            return await handlePaginatedList(page, sort, SITE_URL)
        }

        // Invalid request
        return NextResponse.json(
            { error: "Invalid request parameters. Provide page+sort, page_urls, or page_uniques." },
            { status: 400 }
        )
    } catch (error: any) {
        console.error("[Torob API Error]", error)
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}

// -----------------------------
// Handlers
// -----------------------------

async function handlePaginatedList(page: number, sort: string, SITE_URL: string) {
    if (page < 1) {
        return NextResponse.json({ error: "page must be >= 1" }, { status: 400 })
    }

    const offset = (page - 1) * PAGE_SIZE

    const { products, count } = await sdk.store.product.list({
        limit: PAGE_SIZE,
        offset,
        fields:
            "id,title,handle,description,thumbnail,created_at,updated_at,*variants,*variants.prices,*images,*categories",
    })

    const max_pages = Math.ceil(count / PAGE_SIZE)

    const mappedProducts = products.map((product) =>
        mapProductToTorob(product, SITE_URL)
    )

    return NextResponse.json({
        api_version: "torob_api_v3",
        current_page: page,
        total: count,
        max_pages,
        products: mappedProducts,
    })
}

async function handleByUrls(urls: string[], SITE_URL: string) {
    const handles = urls
        .map((url) => {
            try {
                const pathname = new URL(url).pathname
                return pathname.split("/").filter(Boolean).pop()
            } catch {
                return null
            }
        })
        .filter(Boolean) as string[]

    if (handles.length === 0) {
        return emptyResponse()
    }

    const { products } = await sdk.store.product.list({
        handle: handles,
        fields:
            "id,title,handle,description,thumbnail,created_at,updated_at,*variants,*variants.prices,*images,*categories",
        limit: handles.length,
    })

    return NextResponse.json({
        api_version: "torob_api_v3",
        current_page: 1,
        total: products.length,
        max_pages: 1,
        products: products.map((product) => mapProductToTorob(product, SITE_URL)),
    })
}

async function handleByUniques(uniques: string[], SITE_URL: string) {
    const { products } = await sdk.store.product.list({
        id: uniques,
        fields:
            "id,title,handle,description,thumbnail,created_at,updated_at,*variants,*variants.prices,*images,*categories",
        limit: uniques.length,
    })

    return NextResponse.json({
        api_version: "torob_api_v3",
        current_page: 1,
        total: products.length,
        max_pages: 1,
        products: products.map((product) => mapProductToTorob(product, SITE_URL)),
    })
}

// -----------------------------
// Mapper: Medusa Product → Torob Format
// -----------------------------

function mapProductToTorob(product: HttpTypes.StoreProduct, SITE_URL: string) {
    // Get the cheapest variant price in Toman
    let currentPrice = 0
    let oldPrice: number | undefined = undefined
    let isAvailable = false

    if (product.variants) {
        // Find the lowest price among variants
        const prices = product.variants
            .flatMap((v) => v.calculated_price?.calculated_amount || [])
        const originalPrices = product.variants
            .flatMap((v) => v.calculated_price?.original_amount || [])

        if (prices.length > 0) {
            oldPrice = Math.min(...originalPrices)
            currentPrice = Math.min(...prices) ?? oldPrice
        }

        // Check availability (you may need inventory quantity depending on your setup)
        isAvailable = product.variants.some(
            (v) => v.manage_inventory === false || (v.inventory_quantity ?? 0) > 0
        )
    }

    // Images
    const imageLinks: string[] = []
    if (product.thumbnail) {
        imageLinks.push(product.thumbnail)
    }
    if (product.images) {
        product.images.forEach((img) => {
            if (img.url && img.url !== product.thumbnail) {
                imageLinks.push(img.url)
            }
        })
    }

    // Category
    const categoryName =
        product.categories && product.categories.length > 0
            ? product.categories[0].name
            : undefined

    // Specs (you can expand this with product options/metadata)
    const spec: Record<string, string | number> = {}
    if (product.variants?.[0]?.options) {
        product.variants[0].options.forEach((opt) => {
            if (opt.option?.title && opt.value) {
                spec[opt.option.title] = opt.value
            }
        })
    }

    return {
        page_unique: product.id, // or product.handle if you prefer
        page_url: `${SITE_URL}/products/${product.handle}`,
        product_group_id: product.id, // useful for variants
        title: product.title || "",
        subtitle: undefined, // you can put English title here if available
        current_price: currentPrice, // must be integer in Toman
        old_price: oldPrice,
        availability: isAvailable,
        category_name: categoryName,
        image_links: imageLinks.length > 0 ? imageLinks : ["https://via.placeholder.com/900"],
        short_desc: product.description?.slice(0, 500) || undefined,
        spec,
        guarantee: undefined, // add if you have warranty metadata
        date_added: product.created_at
            ? new Date(product.created_at).toISOString()
            : new Date().toISOString(),
        date_updated: product.updated_at
            ? new Date(product.updated_at).toISOString()
            : undefined,
    }
}

function emptyResponse() {
    return NextResponse.json({
        api_version: "torob_api_v3",
        current_page: 1,
        total: 0,
        max_pages: 1,
        products: [],
    })
}