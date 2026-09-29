"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BadgePercent,
  ChevronDown,
  ChevronRight,
  Heart,
  Layers,
  LayoutGrid,
  Mars,
  MessageCircle,
  Phone,
  Sparkles,
  Tag,
  Truck,
  Venus,
  VenusAndMars,
  X,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { label } from "@/lib/catalog/labels";
import { Media } from "./media";
import { SearchForm } from "./search-suggest";
import { SheetGrabber } from "./sheet-drag";
import { usePhone } from "./device";
import { menuStore, useMenuOpen } from "./app-shell";

/* Serializable nav data built by the server header (shell.tsx). Icons are
   looked up by key here, because components can't cross the server boundary. */
export type ShopKey = "all" | "men" | "women" | "unisex" | "new" | "deals";
export type ShopLink = { key: ShopKey; name: string; href: string; hint: string };
export type CollectionLink = { name: string; href: string; image: string | null; hint: string | null };
export type BrandMenuItem = {
  id: string;
  name: string;
  href: string;
  type: string;
  isFeatured: boolean;
  spotlight?: { name: string; href: string; imageUrl: string };
};
const shopIcons = {
  all: LayoutGrid,
  men: Mars,
  women: Venus,
  unisex: VenusAndMars,
  new: Sparkles,
  deals: BadgePercent,
} satisfies Record<ShopKey, unknown>;

const tel = `tel:${storeConfig.contact.phone.replace(/\s/g, "")}`;
const whatsapp = storeConfig.contact.whatsapp
  ? `https://wa.me/${storeConfig.contact.whatsapp.replace(/\D/g, "")}`
  : null;

/** Two-letter monogram for a brand tile. */
export function monogram(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

/** Monogram tile. Brand logos are usually wordmarks, unreadable at 40px. */
function BrandAvatar({ name }: { name: string }) {
  return (
    <span className="icon-tile brand-avatar" aria-hidden>
      {monogram(name)}
    </span>
  );
}

/**
 * Desktop category row: a grey rail whose white highlight glides to the item
 * under the pointer (or keyboard focus). The highlight is one layer clipped to
 * the item's box, so moving it never reflows. Closes menus on outside click / Escape.
 */
export function DesktopNavigation({
  links,
  children,
  aside,
}: {
  links: { name: string; href: string }[];
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
  const path = usePathname();
  const closeAll = () => ref.current?.querySelectorAll("details[open]").forEach((el) => el.removeAttribute("open"));
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) closeAll();
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  // Menus close when the route changes (a link inside a panel was followed).
  useEffect(() => {
    ref.current?.querySelectorAll("details[open]").forEach((el) => el.removeAttribute("open"));
  }, [path]);
  const moveTo = (target: EventTarget | null) => {
    const item = (target as HTMLElement | null)?.closest<HTMLElement>(".nav-link");
    const layer = glow.current;
    if (!item || !layer || !rail.current?.contains(item) || !ref.current) return;
    // The glow covers the whole nav (its containing block), so clip relative to that.
    const r = ref.current.getBoundingClientRect();
    const i = item.getBoundingClientRect();
    const clip = `inset(${i.top - r.top}px ${r.right - i.right}px ${r.bottom - i.bottom}px ${i.left - r.left}px round ${getComputedStyle(item).borderRadius})`;
    if (layer.dataset.hidden !== undefined) {
      // Appearing: jump to the item, then fade in. Only item-to-item moves glide.
      layer.style.transition = "none";
      layer.style.clipPath = clip;
      void layer.offsetWidth;
      layer.style.transition = "";
      delete layer.dataset.hidden;
    } else layer.style.clipPath = clip;
  };
  const hide = () => glow.current?.setAttribute("data-hidden", "");
  return (
    <nav
      ref={ref}
      aria-label="Main navigation"
      className="desktop-nav store-width"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          closeAll();
          hide();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          const open = ref.current?.querySelector<HTMLDetailsElement>("details[open]");
          open?.removeAttribute("open");
          open?.querySelector("summary")?.focus();
        }
      }}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) closeAll();
      }}
    >
      <div
        ref={rail}
        className="nav-rail"
        onPointerOver={(event) => event.pointerType === "mouse" && moveTo(event.target)}
        onPointerLeave={hide}
        onFocus={(event) => event.target.matches(":focus-visible") && moveTo(event.target)}
      >
        <span ref={glow} className="nav-glow" aria-hidden data-hidden="" />
        {children}
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="nav-link" aria-current={path === link.href ? "page" : undefined}>
            {link.name}
          </Link>
        ))}
      </div>
      <div className="nav-aside">{aside}</div>
    </nav>
  );
}

/** Desktop "Brands" mega panel: hovering or focusing a brand swaps in its lead fragrance on the right. */
export function BrandMenu({ brands }: { brands: BrandMenuItem[] }) {
  const withSpotlight = brands.filter((b) => b.spotlight);
  const initial = (withSpotlight.find((b) => b.isFeatured) ?? withSpotlight[0])?.id;
  const [active, setActive] = useState(initial);
  return (
    <div className="nav-panel brand-panel" onMouseLeave={() => setActive(initial)}>
      <div className="nav-card">
        <div className="nav-card-head">
          <p>
            Brands <span className="count-pill">{brands.length}</span>
          </p>
          <Link href="/brands" className="nav-card-link">
            All brands A–Z <ArrowUpRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="nav-brand-grid">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={b.href}
              className="nav-row"
              data-active={b.id === active || undefined}
              onMouseEnter={() => b.spotlight && setActive(b.id)}
              onFocus={() => b.spotlight && setActive(b.id)}
            >
              <BrandAvatar name={b.name} />
              <span className="nav-row-copy">
                <strong>{b.name}</strong>
                <small>{label(b.type)}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>
      {withSpotlight.length > 0 && (
        <div className="nav-feature">
          {withSpotlight.map((b) => (
            <Link
              key={b.id}
              href={b.spotlight!.href}
              className="nav-feature-card"
              data-active={b.id === active || undefined}
              inert={b.id !== active}
            >
              <Media src={b.spotlight!.imageUrl} alt="" sizes="420px" />
              <span className="nav-feature-caption">
                <span>
                  <small>{b.name} spotlight</small>
                  <strong>{b.spotlight!.name}</strong>
                </span>
                <span className="arrow-chip" aria-hidden>
                  <ArrowUpRight size={16} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ShopIcon({ k }: { k: ShopKey }) {
  const Icon = shopIcons[k];
  return (
    <span className="icon-tile" data-tone={k === "deals" ? "deal" : undefined} aria-hidden>
      <Icon size={17} />
    </span>
  );
}

/** Phone/tablet drawer, laid out like the admin sidebar: labelled groups of icon-tile rows. */
export function MobileMenu({
  shop,
  collections,
  brands,
}: {
  shop: ShopLink[];
  collections: CollectionLink[];
  brands: Pick<BrandMenuItem, "id" | "name" | "href">[];
}) {
  const open = useMenuOpen();
  const setOpen = menuStore.set;
  const phone = usePhone();
  const path = usePathname();
  const current = (href: string) => (href === path ? "page" : undefined);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="icon-button mobile-only" aria-label="Open menu">
        <Menu size={19} />
      </SheetTrigger>
      <SheetContent side={phone ? "bottom" : "left"} className="store-sheet menu-sheet" showCloseButton={false}>
        <SheetGrabber onDismiss={() => setOpen(false)} />
        <div className="menu-sheet-head">
          <SheetTitle className="store-logo">{phone ? "Shop" : storeConfig.store.name}</SheetTitle>
          <SheetClose className="icon-button" aria-label="Close menu">
            <X size={18} />
          </SheetClose>
        </div>
        <SheetDescription className="sr-only">Shop fragrances by collection or brand</SheetDescription>
        <nav
          aria-label="Mobile navigation"
          className="menu-sheet-nav"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <SearchForm className="menu-search" />
          <p className="menu-label">Shop</p>
          {shop.map((link) => (
            <Link key={link.href} href={link.href} className="menu-link" aria-current={current(link.href)}>
              <ShopIcon k={link.key} />
              <span className="menu-link-copy">
                {link.name}
                <small>{link.hint}</small>
              </span>
              <ChevronRight size={16} className="menu-link-go" aria-hidden />
            </Link>
          ))}
          {collections.length > 0 && (
            <>
              <p className="menu-label">Collections</p>
              {collections.map((c) => (
                <Link key={c.href} href={c.href} className="menu-link" aria-current={current(c.href)}>
                  <span className="icon-tile" aria-hidden>
                    {c.image ? <Media src={c.image} alt="" sizes="48px" /> : <Layers size={17} />}
                  </span>
                  <span className="menu-link-copy">{c.name}</span>
                  <ChevronRight size={16} className="menu-link-go" aria-hidden />
                </Link>
              ))}
            </>
          )}
          <details className="menu-brands">
            <summary className="menu-link">
              <span className="icon-tile" aria-hidden>
                <Tag size={17} />
              </span>
              <span className="menu-link-copy">
                Brands
                <small>{brands.length} houses</small>
              </span>
              <ChevronDown size={16} className="menu-link-go" aria-hidden />
            </summary>
            <div className="menu-brand-grid">
              {brands.map((b) => (
                <Link key={b.id} href={b.href} className="menu-brand">
                  <BrandAvatar name={b.name} />
                  <span>{b.name}</span>
                </Link>
              ))}
              <Link href="/brands" className="menu-brand menu-brand-all">
                All brands A–Z <ArrowUpRight size={15} aria-hidden />
              </Link>
            </div>
          </details>
          <p className="menu-label">Help</p>
          <Link href="/track-order" className="menu-link" aria-current={current("/track-order")}>
            <span className="icon-tile" aria-hidden>
              <Truck size={17} />
            </span>
            <span className="menu-link-copy">Track your order</span>
            <ChevronRight size={16} className="menu-link-go" aria-hidden />
          </Link>
          {storeConfig.features.wishlist && (
            <Link href="/wishlist" className="menu-link" aria-current={current("/wishlist")}>
              <span className="icon-tile" aria-hidden>
                <Heart size={17} />
              </span>
              <span className="menu-link-copy">Wishlist</span>
              <ChevronRight size={16} className="menu-link-go" aria-hidden />
            </Link>
          )}
        </nav>
        <div className="menu-sheet-contact">
          <p>
            <small>Order by phone</small>
            {storeConfig.contact.phone}
          </p>
          <div>
            <a className="button primary" href={tel}>
              <Phone size={15} aria-hidden /> Call
            </a>
            {whatsapp && (
              <a className="button" href={whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle size={15} aria-hidden /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
