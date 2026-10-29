"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Product, ProductVariant } from "@/types";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils/utils";

interface ProductCardProps {
  product: Product;
  /** Product only carries brandId, so the parent resolves the display name. */
  brandName?: string;
  /** Display name of the product's primary category (first of categoryIds). */
  categoryName?: string;
}

/** A variant can be bought if stock isn't tracked, units remain, or backorders are allowed. */
function isPurchasable(v: ProductVariant) {
  const { trackInventory, quantity, allowBackorder } = v.inventory;
  return !trackInventory || quantity > 0 || allowBackorder;
}

export function ProductCard({
  product,
  brandName,
  categoryName,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Default variant: first purchasable one, else the first one.
  const variant = product.variants.find(isPurchasable) ?? product.variants[0];
  if (!variant) return null; // no variants means nothing to price or buy

  const soldOut = !product.variants.some(isPurchasable);
  const canQuickAdd = product.variants.length === 1 && isPurchasable(variant);

  const brand = brandName ?? "";
  // const gradient = getProductGradient(brand || product.brandId)

  // Prefer the default variant's photos, then the product's.
  const gallery = variant.images.length > 0 ? variant.images : product.images;
  const image = gallery[0];
  const hasImage = !!image && !imgError;

  const compareAt = variant.compareAtPrice ?? 0;
  const onSale = compareAt > variant.price;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem(variant.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      <div className="card-dark overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className={`relative aspect-square overflow-hidden`}>
          {hasImage ? (
            <Image
              src={image.url}
              alt={image.alt || product.name}
              fill
              className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                soldOut ? "opacity-60" : ""
              }`}
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Decorative bottle icon */}
              <svg
                className="w-16 h-16 text-gold opacity-40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 3v1H5v2l1 1v10a2 2 0 002 2h8a2 2 0 002-2V7l1-1V4h-4V3H9zm0 2h6v1H9V5zM7 8h10v9a1 1 0 01-1 1H8a1 1 0 01-1-1V8zm2 2v6h2v-6H9zm4 0v6h2v-6h-2z" />
              </svg>
              {brand && (
                <span className="text-gold opacity-60 text-xs mt-2 tracking-widest uppercase">
                  {brand}
                </span>
              )}
            </div>
          )}

          {/* Brand badge */}
          {brand && (
            <div className="absolute top-2 left-2">
              <span className="bg-white/90 backdrop-blur-sm text-coral-deep text-xs px-2 py-1 rounded-full tracking-wider shadow-sm">
                {brand}
              </span>
            </div>
          )}

          {soldOut && (
            <div className="absolute top-2 right-2">
              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full tracking-wider">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          {categoryName && (
            <p className="text-cream-muted text-xs tracking-widest uppercase mb-1">
              {categoryName}
            </p>
          )}
          <h3 className="font-serif text-cream text-sm font-medium leading-tight mb-3 flex-1 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="flex items-baseline gap-2">
              <span className="text-gold font-bold text-lg">
                {formatPrice(variant.price, variant.currency)}
              </span>
              {onSale && (
                <del className="text-cream-muted text-xs">
                  {formatPrice(compareAt, variant.currency)}
                </del>
              )}
            </span>
            {/* Multi-variant products need a choice first, so the card links to the detail page instead. */}
            {canQuickAdd && (
              <button
                onClick={handleAddToCart}
                className={`text-xs font-semibold px-3 py-2 rounded-sm transition-all duration-200 ${
                  added
                    ? "bg-green-600 text-white scale-95"
                    : "bg-coral text-white hover:bg-coral-deep hover:scale-105 active:scale-95"
                }`}
              >
                {added ? "✓ Añadido" : "+ Carrito"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
