// lib/slug-matcher.ts

const INCLUDED_SLUGS = new Set([
    "home",
    "about"
]);

export function shouldHandleEditPath(slug: string | string[]): boolean {
  // Convert to string path
  const slugPath = Array.isArray(slug) ? slug.join('/') : slug;
  
  // ✅ Allow root/index path (empty slug)
  if (slugPath === '' || (Array.isArray(slug) && slug.length === 0)) {
    return true;
  }
  
  // Get first segment for other checks
  const firstSegment = slugPath.split('/')[0];
  
  // Check if excluded
  if (INCLUDED_SLUGS.has(firstSegment)) {
    return true;
  }
  
  // Allow everything else
  return true;
}