"use client"
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import Media from "@/components/ui/NcImage";
// import { WishlistButton } from "./wishlist-button";
// import { QuickAdd } from "./quick-add";
import { Product, ProductVariant } from "@/types";
import { StarRating } from "./star-rating";
import { formatPrice, getPercentageDiff } from "@/lib/utils/utils";
import { getFullImageUrl } from "@/lib/utils/image-url";

/** A variant can be bought if stock isn't tracked, units remain, or backorders are allowed. */
function isPurchasable(v: ProductVariant) {
  const { trackInventory, quantity, allowBackorder } = v.inventory;
  return !trackInventory || quantity > 0 || allowBackorder;
}

/** Default variant for the card: first purchasable one, else the first one. */
function pickDefaultVariant(
  variants: ProductVariant[],
): ProductVariant | undefined {
  return variants.find(isPurchasable) ?? variants[0];
}

/** Human label for a variant: its option values ("Black / M"), falling back to its name. */
function variantLabel(v: ProductVariant) {
  return v.options.length > 0
    ? v.options.map((o) => o.value).join(" / ")
    : v.name;
}

/**
 * Product tile: a grey panel holding the photo and a white info plate, in the
 * admin panel's language. The name link stretches over the whole card
 * (`.product-card-link::after`); the heart and quick add sit above it.
 *
 * `brandName` is passed in because `Product` only carries `brandId`.
 */
export function ProductCard({
  product: p,
  brandName,
  priority = false,
  storeConfig,
}: {
  product: Product;
  brandName?: string;
  priority?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storeConfig?: Record<string, any>;
  }) {
  const v = pickDefaultVariant(p.variants);
  if (!v) return null; // a product with no variants can't be priced or bought

  const label = variantLabel(v);
  const hasStock = p.variants.some(isPurchasable);
  const canAdd = isPurchasable(v);

  // Prefer the default variant's own photos, then fall back to the product's.
  const gallery = v.images.length > 0 ? v.images : p.images;
  const image = gallery?.[0];
  const hoverImage = gallery?.[1];

  const compareAt = v.compareAtPrice ?? 0;
  const onSale = compareAt > v.price;
  const discount = onSale ? getPercentageDiff(compareAt, v.price) : 0;

  const { trackInventory, quantity } = v.inventory;
  const low =
    hasStock &&
    trackInventory &&
    quantity > 0 &&
    quantity <= storeConfig?.catalog.lowStockThreshold;

  return (
    <article className="product-card" data-soldout={!hasStock || undefined}>
      <div className="product-card-media">
        <Media
          priority={priority}
          src={getFullImageUrl(image?.url)}
          alt={image?.alt ?? p.name}
          sizes="(max-width: 640px) 70vw, (max-width: 1100px) 33vw, 25vw"
        />
        {hoverImage && (
          <Media
            className="hover-image"
            src={getFullImageUrl(image.url)}
            alt=""
            sizes="(max-width: 640px) 70vw, 25vw"
          />
        )}
        {storeConfig?.features.dealBadges && +discount > 0 && (
          <span className="product-card-badges">
            <span className="badge deal">−{discount}%</span>
          </span>
        )}
        {(!hasStock || low) && (
          <span className="stock-flag" data-tone={hasStock ? "warn" : "bad"}>
            <i aria-hidden />
            {hasStock ? "Few left" : "Sold out"}
          </span>
        )}
        {/*{storeConfig?.features.wishlist && (
          <WishlistButton id={p.id} name={p.name} />
        )}
        {canAdd && (
          <QuickAdd
            variantId={v.id}
            price={v.price}
            name={p.name}
            size={label}
          />
        )}*/}
      </div>
      <div className="product-card-body">
        {brandName && <p className="product-card-brand">{brandName}</p>}
        <h3 className="product-card-name">
          <Link
            href={`/products/${p.slug}`}
            className="product-card-link"
            transitionTypes={["nav-forward"]}
          >
            {p.name}
          </Link>
        </h3>
        <ul className="product-card-tags" aria-label="Details">
          {p.tags.slice(0, 1).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
          <li>{label}</li>
          {p.variants.length > 1 && <li>{p.variants.length} options</li>}
        </ul>
        {p.reviewCount > 0 && (
          <StarRating rating={p.rating} reviewCount={p.reviewCount} size="sm" />
        )}
        <div className="product-card-foot">
          <p className="product-card-price">
            <strong>{formatPrice(v.price, v.currency)}</strong>
            {storeConfig?.features.dealBadges && onSale && (
              <del>{formatPrice(compareAt, v.currency)}</del>
            )}
          </p>
          <span className="arrow-chip flex items-center justify-center" aria-hidden>
            <ArrowUpLeft size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
