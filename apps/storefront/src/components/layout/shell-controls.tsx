"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { storeConfig } from "../../../store.config";
// import { WishlistSheet } from "./wishlist";
import { SearchForm } from "./search-suggest";
import { CartDrawer } from "../cart/cart-drawer";

export { SearchForm };

/** Right-side icons: search (phones), wishlist, bag. */
export function HeaderActions() {
  return (
    <div className="header-actions">
      <Link className="icon-button mobile-only" href="/search" aria-label="Search fragrances">
        <Search size={18} />
      </Link>
      {/*{storeConfig.features.wishlist && <WishlistSheet />}*/}
      <CartDrawer />
    </div>
  );
}

export function Announcement({
  messages,
}: {
  messages: { title: string | null; href: string | null; rel?: string }[];
}) {
  const announcementRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0),
    [hidden, setHidden] = useState(false);
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = !!sessionStorage.getItem("attar-announcement-dismissed");
    } catch {}
    if (dismissed) {
      const timer = setTimeout(() => setHidden(true), 0);
      return () => clearTimeout(timer);
    }
  }, []);
  useEffect(() => {
    if (messages.length < 2 || hidden) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = setInterval(() => {
      const element = announcementRef.current;
      if (reduced.matches || document.hidden || element?.contains(document.activeElement) || element?.matches(":hover")) return;
      setIndex((i) => (i + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [messages.length, hidden]);
  if (hidden || !messages.length) return null;
  const message = messages[index % messages.length];
  return (
    <div className="announcement" ref={announcementRef}>
      <div key={index} className="announcement-text">
        {message.href ? (
          <Link href={message.href} rel={message.rel}>
            {message.title}
          </Link>
        ) : (
          message.title
        )}
      </div>
      <button
        className="announcement-close"
        aria-label="Dismiss announcement"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem("attar-announcement-dismissed", "1");
          } catch {}
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      className="newsletter"
      onSubmit={(event) => {
        event.preventDefault();
        console.info("Newsletter signup stub");
        setSubmitted(true);
      }}
    >
      <label htmlFor="newsletter">News by email</label>
      <div className="newsletter-field">
        <input id="newsletter" type="email" required placeholder="Your email address" autoComplete="email" />
        <button type="submit" className="button primary sm">
          Subscribe
        </button>
      </div>
      <p>{submitted ? "Thanks. Email subscriptions are not active yet." : "Email subscriptions are coming soon."}</p>
    </form>
  );
}
