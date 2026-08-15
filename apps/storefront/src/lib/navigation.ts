export interface NavItem {
  name: string
  href: string
}

export interface NavSection {
  label: string
  items: NavItem[]
}

// Single source of truth for all navigation across desktop header,
// mobile menu, and anywhere else. Edit this one file to update all menus.

export const shopLinks: NavItem[] = [
  { name: "الکترونیک", href: "/electronics" },
  { name: "پوشاک", href: "/clothing" },
  { name: "خانه و آشپزخانه", href: "/home-kitchen" },
  { name: "لوازم جانبی", href: "/accessories" },
  { name: "غذا و نوشیدنی", href: "/food-drink" },
]

export const accountLinks: NavItem[] = [
  { name: "حساب کاربری", href: "/account" },
  { name: "محبوب ها", href: "/wishlist" },
  { name: "سفارشات", href: "/account/orders" },
]

export const infoLinks: NavItem[] = [
  { name: "محصولات", href: "/shop" },
  { name: "بلاگ", href: "/blog" },
  // { name: "Pages", href: "/pages" },
  { name: "درباره ما", href: "/about" },
  { name: "تماس با ما", href: "/contact" },
  { name: "سوالات پر تکرار", href: "/faq" },
]

export const mobileMenuSections: NavSection[] = [
  { label: "فروشگاه", items: shopLinks },
  { label: "حساب کاربری", items: accountLinks },
  { label: "اطلاعات", items: infoLinks },
]
