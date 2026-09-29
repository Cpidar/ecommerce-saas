import Link from "next/link";
import {
  ArrowUpRight,
  BadgePercent,
  ChevronDown,
  Layers,
  LayoutGrid,
  Mail,
  MapPin,
  Mars,
  Phone,
  Sparkles,
  Truck,
  Venus,
  VenusAndMars,
} from "lucide-react";
import { MessageCircle, Camera, Video, Music2 } from "./icons";
import { storeConfig as config } from "../../../store.config";
import { getNavigation, getBanners, getBrandSpotlights } from "@/lib/catalog/content";
import { Announcement, HeaderActions, Newsletter, SearchForm } from "./shell-controls";
import {
  BrandMenu,
  DesktopNavigation,
  MobileMenu,
  type CollectionLink,
  type ShopLink,
} from "./nav";
import { Media } from "./media";
import { AppBarBack, AppBarTitle, NavProgress } from "./app-shell";
import { Suspense } from "react";
import { ugcRel } from "@/lib/demo/links";
export const whatsappHref = config.contact.whatsapp
  ? `https://wa.me/${config.contact.whatsapp.replace(/\D/g, "")}`
  : null;
const tel = `tel:${config.contact.phone.replace(/\s/g, "")}`;
// const paymentNames = Object.entries(config.checkout.paymentMethods)
//   .filter(([, method]) => method.enabled)
//   .map(([key, method]) => ("label" in method ? method.label : key === "bkash" ? "bKash" : "Nagad"));

function Logo({ className = "store-logo" }: { className?: string }) {
  return (
    <Link href="/" className={className}>
      {config.store.logo ? <Media src={config.store.logo} alt={config.store.name} sizes="200px" /> : config.store.name}
    </Link>
  );
}

// Values from a "use client" module arrive here as references, so the server panel keeps its own map.
export const shopIcons = {
  all: LayoutGrid,
  men: Mars,
  women: Venus,
  unisex: VenusAndMars,
  new: Sparkles,
  deals: BadgePercent,
};
export const shop: ShopLink[] = [
  { key: "all", name: "All fragrances", href: "/products", hint: "Everything in store" },
  { key: "men", name: "Men", href: "/products?gender=men", hint: "Fragrances for him" },
  { key: "women", name: "Women", href: "/products?gender=women", hint: "Fragrances for her" },
  { key: "unisex", name: "Unisex", href: "/products?gender=unisex", hint: "Made for anyone" },
  { key: "new", name: "New arrivals", href: "/products?new=true", hint: "Just landed" },
  { key: "deals", name: "Deals", href: "/products?deal=true&sort=discount", hint: "Marked down now" },
];

/** Desktop "Shop" mega panel: admin-style white cards on a grey panel. Server-rendered, no JS. */
function ShopMenu({ collections }: { collections: CollectionLink[] }) {
  const promos = collections.filter((c) => c.image).slice(0, 2);
  return (
    <div className="nav-panel shop-panel" data-promos={promos.length}>
      <div className="nav-card">
        <div className="nav-card-head">
          <p>Shop by</p>
        </div>
        <div className="nav-list">
          {shop.map((link) => {
            const Icon = shopIcons[link.key];
            return (
              <Link key={link.key} href={link.href} className="nav-row">
                <span className="icon-tile" data-tone={link.key === "deals" ? "deal" : undefined} aria-hidden>
                  <Icon size={17} />
                </span>
                <span className="nav-row-copy">
                  <strong>{link.name}</strong>
                  <small>{link.hint}</small>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {collections.length > 0 && (
        <div className="nav-card">
          <div className="nav-card-head">
            <p>
              Collections <span className="count-pill">{collections.length}</span>
            </p>
          </div>
          <div className="nav-list">
            {collections.map((c) => (
              <Link key={c.href} href={c.href} className="nav-row">
                <span className="icon-tile" aria-hidden>
                  {c.image ? <Media src={c.image} alt="" sizes="48px" /> : <Layers size={17} />}
                </span>
                <span className="nav-row-copy">
                  <strong>{c.name}</strong>
                  {c.hint && <small>{c.hint}</small>}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      {promos.map((c) => (
        <Link key={c.href} href={c.href} className="nav-promo">
          <Media src={c.image!} alt="" sizes="360px" />
          <span className="nav-feature-caption">
            <span>
              <small>Collection</small>
              <strong>{c.name}</strong>
            </span>
            <span className="arrow-chip" aria-hidden>
              <ArrowUpRight size={16} />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export async function StoreHeader() {
  const [nav, spotlights, banners] = await Promise.all([
    getNavigation(),
    getBrandSpotlights(),
    config.announcementBar.enabled ? getBanners() : Promise.resolve([]),
  ]);
  const collections: CollectionLink[] = nav.collections
    .filter((c) => !["men", "women", "unisex", "deals"].includes(c.slug))
    .map((c) => ({ name: c.name, href: `/c/${c.slug}`, image: c.heroImageUrl, hint: c.description }));
  // The rail keeps the everyday shortcuts; everything else lives in the Shop panel.
  const railLinks = [
    ...shop.filter((l) => ["men", "women", "unisex", "new"].includes(l.key)),
    ...collections.slice(0, 3),
  ].map(({ name, href }) => ({ name, href }));
  const brands = nav.brands.map((b) => {
    const product = spotlights.get(b.id);
    return {
      id: b.id,
      name: b.name,
      href: `/brands/${b.slug}`,
      type: b.brandType,
      isFeatured: b.isFeatured,
      spotlight: product && { name: product.name, href: `/products/${product.slug}`, imageUrl: product.imageUrl },
    };
  });
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {config.announcementBar.enabled && (
        <Announcement
          messages={banners
            .filter((b) => b.placement === "announcement")
            .map((b) => ({ title: b.title, href: b.href, rel: ugcRel(b.href) }))}
        />
      )}
      <span className="header-scroll-sentinel" aria-hidden />
      <header className="store-header">
        <div className="header-main store-width">
          <MobileMenu
            shop={shop}
            collections={collections}
            brands={brands.map(({ id, name, href }) => ({ id, name, href }))}
          />
          {/* Phones: back button + collapsing title (app-shell.tsx). Larger screens: the logo. */}
          <AppBarBack />
          <AppBarTitle logo={<Logo />} />
          <Logo className="store-logo header-logo" />
          <SearchForm className="header-search" />
          <a className="header-call" href={tel}>
            <span className="icon-tile sm">
              <Phone size={15} aria-hidden />
            </span>
            <span>
              <small>Order by phone</small>
              {config.contact.phone}
            </span>
          </a>
          <HeaderActions />
          <a className="icon-button appbar-call" href={tel} aria-label={`Call ${config.contact.phone} to order`}>
            <Phone size={18} aria-hidden />
          </a>
        </div>
        <DesktopNavigation
          links={railLinks}
          aside={
            <>
              <Link href="/track-order" className="nav-link">
                <Truck size={15} aria-hidden /> Track order
              </Link>
              <Link href="/products?deal=true&sort=discount" className="nav-link" data-accent>
                <BadgePercent size={15} aria-hidden /> Deals
              </Link>
            </>
          }
        >
          <details name="store-navigation" className="nav-menu">
            <summary className="nav-link">
              Shop <ChevronDown size={15} aria-hidden />
            </summary>
            <ShopMenu collections={collections} />
          </details>
          <details name="store-navigation" className="nav-menu">
            <summary className="nav-link">
              Brands <ChevronDown size={15} aria-hidden />
            </summary>
            <BrandMenu brands={brands} />
          </details>
        </DesktopNavigation>
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
      </header>
    </>
  );
}

export async function StoreFooter() {
  const { pages } = await getNavigation();
  const socialIcons = {
    facebook: MessageCircle,
    instagram: Camera,
    youtube: Video,
    tiktok: Music2,
  };
  const socials = Object.entries(config.contact.social).filter(([, url]) => url);
  return (
    <footer className="store-footer">
      <div className="store-width">
        <div className="footer-card">
          <div className="footer-brand">
            <Logo className="store-logo footer-logo" />
            <p>{config.store.tagline}</p>
            <ul className="footer-contact">
              <li>
                <Phone size={15} aria-hidden />
                <a href={tel}>{config.contact.phone}</a>
                {whatsappHref && (
                  <>
                    {" · "}
                    <a href={whatsappHref}>WhatsApp</a>
                  </>
                )}
              </li>
              {config.contact.email && (
                <li>
                  <Mail size={15} aria-hidden />
                  <a href={`mailto:${config.contact.email}`}>{config.contact.email}</a>
                </li>
              )}
              {config.contact.addressLines.length > 0 && (
                <li>
                  <MapPin size={15} aria-hidden />
                  <address>{config.contact.addressLines.join(", ")}</address>
                </li>
              )}
            </ul>
            {socials.length > 0 && (
              <div className="social-links">
                {socials.map(([key, url]) => {
                  const Icon = socialIcons[key as keyof typeof socialIcons];
                  return (
                    <a key={key} href={url!} aria-label={key} className="icon-button">
                      <Icon size={17} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <nav aria-label="Shop" className="footer-links">
            <p>Shop</p>
            <Link href="/products">All fragrances</Link>
            <Link href="/brands">Brands</Link>
            <Link href="/products?new=true">New arrivals</Link>
            <Link href="/products?deal=true&sort=discount">Deals</Link>
          </nav>
          <nav aria-label="Help and information" className="footer-links">
            <p>Help</p>
            <Link href="/track-order">Track your order</Link>
            {pages.map((page) => (
              <Link key={page.slug} href={`/pages/${page.slug}`}>
                {page.title}
              </Link>
            ))}
          </nav>
          <div className="footer-newsletter">
            <Newsletter />
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {config.store.name}
          </p>
          {/*<ul className="payment-chips" aria-label="Payment methods">
            {paymentNames.map((name) => (
              <li key={name} className="chip">
                {name}
              </li>
            ))}
          </ul>*/}
        </div>
      </div>
    </footer>
  );
}
