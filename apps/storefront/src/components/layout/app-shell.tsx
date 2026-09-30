"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { addTransitionType, startTransition, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { CaretLeft, Heart, House, MagnifyingGlass, ShoppingBag, SquaresFour, WhatsappLogo } from "@phosphor-icons/react";
import { CountBadge } from "./count-badge";
import { Media } from "./media";
// import { useSavedIds } from "./saved-products";
import { haptic, isPhone } from "./device";
import { storeConfig } from "../../../store.config";
import { formatPrice } from "@/lib/utils/utils";
import { useCartStore } from "@/store/cart";

/*
 * Phone app shell (≤760px, styles in src/app/app-shell.css): a floating tab
 * bar, a native-style navigation bar (back button + title that appears once
 * the page's h1 scrolls away) and an "Added to bag" toast. Tablets and
 * desktops keep the regular header; these pieces hide themselves there.
 */

/* The Browse sheet (MobileMenu in nav.tsx) opens from the header on tablets and
   from the Shop tab on phones, so its open state lives outside both. */
let menuOpen = false;
const menuListeners = new Set<() => void>();
export const menuStore = {
  get: () => menuOpen,
  set(open: boolean) {
    menuOpen = open;
    menuListeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    menuListeners.add(listener);
    return () => menuListeners.delete(listener);
  },
};
export function useMenuOpen() {
  return useSyncExternalStore(menuStore.subscribe, menuStore.get, () => false);
}

/* Routes that are their own full-screen task: the tab bar steps aside for their docked actions. */
const tabless = [/^\/products\/[^/]+$/, /^\/checkout/, /^\/order\//, /^\/demo/];
export const hidesTabBar = (path: string) => tabless.some((pattern) => pattern.test(path));

/** Where "back" goes when the shopper landed here directly (a shared link, a fresh tab). */
function parentOf(path: string) {
  if (/^\/products\/[^/]+/.test(path) || /^\/c\//.test(path)) return "/products";
  if (/^\/brands\/[^/]+/.test(path)) return "/brands";
  if (/^\/checkout/.test(path)) return "/cart";
  return "/";
}

const whatsapp = storeConfig.contact.whatsapp
  ? `https://wa.me/${storeConfig.contact.whatsapp.replace(/\D/g, "")}`
  : null;

// The pages visited in this tab, so "back" knows whether history holds one of ours.
const visited: string[] = [];
let popping = false;
// Resolves the back button's view transition once the previous page has rendered.
let backLanded: (() => void) | null = null;

/**
 * Goes back through history with a pop animation. History traversals don't run
 * through React transitions, so this wraps router.back() in a view transition
 * of its own (html[data-nav-back] picks the animation in app-shell.css).
 */
function animatedBack(back: () => void) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof document.startViewTransition !== "function" || !isPhone() || reduced) return back();
  const root = document.documentElement;
  root.toggleAttribute("data-nav-back", true);
  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        backLanded = resolve;
        back();
        setTimeout(resolve, 1200); // never hold the screen if the page is slow
      }),
  );
  transition.finished.finally(() => root.removeAttribute("data-nav-back"));
}

/** Nav bar leading slot: a back chevron everywhere except home. */
export function AppBarBack() {
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    const onPop = () => {
      popping = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (popping) {
      popping = false;
      visited.pop();
      if (visited.at(-1) !== path) visited.push(path);
    } else if (visited.at(-1) !== path) visited.push(path);
    if (backLanded) {
      const landed = backLanded;
      backLanded = null;
      requestAnimationFrame(() => landed());
    }
  }, [path]);
  // Home has nowhere to go back to; the slot offers WhatsApp (a common way to order) or stays empty.
  if (path === "/")
    return whatsapp ? (
      <a className="icon-button appbar-lead" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
        <WhatsappLogo size={20} aria-hidden />
      </a>
    ) : (
      <span className="appbar-slot" aria-hidden />
    );
  return (
    <button
      type="button"
      className="appbar-back"
      aria-label="Go back"
      onClick={() => {
        haptic(6);
        if (visited.length > 1) animatedBack(() => router.back());
        else
          startTransition(() => {
            addTransitionType("nav-back");
            router.push(parentOf(path));
          });
      }}
    >
      <CaretLeft size={22} weight="bold" aria-hidden />
    </button>
  );
}

/**
 * Nav bar title: the store logo, always, so every screen carries the brand.
 * Once the page's own large title (its h1) slides under the bar, the same
 * words fade in as a small line beneath the logo.
 */
export function AppBarTitle({ logo }: { logo: React.ReactNode }) {
  const path = usePathname();
  const [title, setTitle] = useState({ path: "", text: "", shown: false });
  useEffect(() => {
    if (path === "/") return;
    let observer: IntersectionObserver | undefined;
    let heading: HTMLElement | null = null;
    // Follow the page's current h1. A loading skeleton's heading gets replaced
    // by the real one, so re-attach whenever it changes.
    const attach = () => {
      const next = document.querySelector<HTMLElement>("#main h1");
      if (next === heading) return;
      observer?.disconnect();
      heading = next;
      if (!heading) return setTitle({ path, text: "", shown: false });
      const text = heading.innerText.replace(/\s+/g, " ").trim();
      const header = document.querySelector<HTMLElement>(".store-header");
      const offset = header ? header.getBoundingClientRect().height : 56;
      observer = new IntersectionObserver(
        ([entry]) => {
          const shown = entry.target.isConnected && !entry.isIntersecting && entry.boundingClientRect.top < offset + 1;
          setTitle({ path, text, shown });
        },
        { rootMargin: `-${Math.round(offset)}px 0px 0px 0px` },
      );
      observer.observe(heading);
    };
    const frame = requestAnimationFrame(attach);
    const main = document.getElementById("main");
    const mutations = new MutationObserver(attach);
    if (main) mutations.observe(main, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [path]);
  const current = path !== "/" && title.path === path;
  return (
    <div className="appbar-title" data-shown={(current && title.shown) || undefined}>
      {logo}
      <span className="appbar-subtitle" aria-hidden>
        {current ? title.text : ""}
      </span>
    </div>
  );
}

type Tab = {
  key: string;
  label: string;
  icon: typeof House;
  href?: string;
  active: boolean;
  badge?: React.ReactNode;
  onPress?: () => void;
};

/**
 * Floating tab bar. The grey pill glides to the active tab (one layer, moved
 * with transform), icons fill when selected, and the bar tucks its labels away
 * while you scroll down, then brings them back on the way up.
 */
export function TabBar() {
  const path = usePathname();
  const cart = useCartStore();
  const saved = useSavedIds("wishlist");
  const menu = useMenuOpen();
  const bar = useRef<HTMLElement>(null);
  const hidden = hidesTabBar(path);
  const shopping = path === "/products" || /^\/(c|brands)(\/|$)/.test(path);
  const tabs: Tab[] = [
    { key: "home", label: "Home", icon: House, href: "/", active: path === "/" && !menu && !cart.isOpen },
    {
      key: "shop",
      label: "Shop",
      icon: SquaresFour,
      active: menu || (shopping && !cart.isOpen),
      onPress: () => menuStore.set(true),
    },
    { key: "search", label: "Search", icon: MagnifyingGlass, href: "/search", active: path === "/search" && !menu && !cart.isOpen },
    ...(storeConfig.features.wishlist
      ? [
          {
            key: "saved",
            label: "Saved",
            icon: Heart,
            href: "/wishlist",
            active: path === "/wishlist" && !menu && !cart.isOpen,
            badge: <CountBadge value={saved.length} hideZero />,
          },
        ]
      : []),
    {
      key: "bag",
      label: "Bag",
      icon: ShoppingBag,
      active: cart.isOpen || (path === "/cart" && !menu),
      badge: <CountBadge value={cart.count} ready={cart.ready} hideZero />,
      onPress: () => (path === "/cart" ? window.scrollTo({ top: 0, behavior: "smooth" }) : cart.setOpen(true)),
    },
  ];
  const activeIndex = tabs.findIndex((tab) => tab.active);

  // Tuck the labels away while scrolling down; any upward scroll or the page top brings them back.
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const element = bar.current;
        if (!element) return;
        if (y < 80 || y < last - 6) delete element.dataset.compact;
        else if (y > last + 6) element.dataset.compact = "";
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    if (bar.current) delete bar.current.dataset.compact;
  }, [path]);

  // The page leaves room for the bar only while it's showing.
  useLayoutEffect(() => {
    document.documentElement.toggleAttribute("data-tabbar", !hidden);
    return () => document.documentElement.removeAttribute("data-tabbar");
  }, [hidden]);

  return (
    <nav
      ref={bar}
      className="tab-bar"
      aria-label="App navigation"
      data-hidden={hidden || undefined}
      inert={hidden}
      style={{ "--tabs": tabs.length, "--active": Math.max(activeIndex, 0) } as React.CSSProperties}
    >
      <span className="tab-indicator" aria-hidden data-none={activeIndex < 0 || undefined} />
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const content = (
          <>
            <span className="tab-icon">
              <Icon size={24} weight={tab.active ? "fill" : "regular"} aria-hidden />
              {tab.badge}
            </span>
            <span className="tab-label">{tab.label}</span>
          </>
        );
        const press = () => {
          haptic(6);
          menuStore.set(false);
          if (tab.key !== "bag") cart.setOpen(false);
        };
        return tab.href ? (
          <Link
            key={tab.key}
            href={tab.href}
            className="tab"
            data-active={tab.active || undefined}
            aria-current={tab.active ? "page" : undefined}
            onClick={() => {
              press();
              if (tab.href === path) window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {content}
          </Link>
        ) : (
          <button
            key={tab.key}
            type="button"
            className="tab"
            data-active={tab.active || undefined}
            aria-haspopup="dialog"
            aria-expanded={tab.key === "bag" ? cart.isOpen : menu}
            aria-label={tab.key === "bag" ? `Bag, ${cart.count} ${cart.count === 1 ? "item" : "items"}` : undefined}
            onClick={() => {
              press();
              tab.onPress?.();
            }}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Phones don't pop the whole bag open for every add. This banner confirms the
 * item (photo, name, new total) above the tab bar, and "View" opens the bag.
 */
export function AddedToast() {
  const cartStore = useCartStore();
  const [shown, setShown] = useState<{ id: number; variantId: string } | null>(null);
  const [seen, setSeen] = useState(0);
  const added = cartStore.lastAdded;
  if (added && added.id !== seen) {
    setSeen(added.id);
    setShown(added);
  }
  useEffect(() => {
    if (!shown) return;
    haptic([10, 40, 10]);
    const timer = setTimeout(() => setShown(null), 3600);
    return () => clearTimeout(timer);
  }, [shown]);
  const item = shown && cartStore.cart?.items.find((line) => line.variantId === shown.variantId);
  const visible = !!item && !cartStore.isOpen && !cartStore.error;
  return (
    <div className="added-toast" data-visible={visible || undefined} role="status" aria-live="polite">
      {item && (
        <>
          <span className="added-toast-image">
            <Media src={item.image} alt="" sizes="48px" />
          </span>
          <span className="added-toast-copy">
            <small>Added to bag</small>
            <strong>{item.name}</strong>
            <span>
              {item.label} · Bag total {formatPrice(cartStore.subtotal - cartStore.discount)}
            </span>
          </span>
          <button
            type="button"
            className="button sm primary"
            tabIndex={visible ? 0 : -1}
            onClick={() => {
              setShown(null);
              cartStore.openCart();
            }}
          >
            View
          </button>
        </>
      )}
    </div>
  );
}

/**
 * A thin bar along the top that starts the moment an internal link is tapped
 * and completes when the next page lands, so a slow network never feels like
 * a missed tap. Phones only (app-shell.css).
 */
export function NavProgress() {
  const path = usePathname();
  const search = useSearchParams();
  const key = `${path}?${search}`;
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [lastKey, setLastKey] = useState(key);
  if (lastKey !== key) {
    setLastKey(key);
    if (state === "loading") setState("done");
  }
  useEffect(() => {
    const start = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setState("loading");
    };
    document.addEventListener("click", start, true);
    return () => document.removeEventListener("click", start, true);
  }, []);
  useEffect(() => {
    if (state === "idle") return;
    // Fade out after finishing; give up quietly if a navigation never lands.
    const timer = setTimeout(() => setState("idle"), state === "done" ? 450 : 12000);
    return () => clearTimeout(timer);
  }, [state]);
  return <div className="nav-progress" data-state={state} aria-hidden />;
}
