export interface SeoMetadata {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
}

/**
 * Dynamically updates document title and all OpenGraph / Twitter meta tags
 * in client-side React SPA environments to ensure high-fidelity previews.
 */
export function updateDynamicMetaTags(meta: SeoMetadata): void {
  if (typeof document === 'undefined') return;

  // 1. Update Document Title
  document.title = meta.title;

  const setMetaTag = (attrName: string, attrVal: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 2. Standard Search Meta
  setMetaTag('name', 'description', meta.description);

  // 3. OpenGraph Social Meta Tags
  setMetaTag('property', 'og:title', meta.title);
  setMetaTag('property', 'og:description', meta.description);
  setMetaTag('property', 'og:type', meta.type || 'website');
  setMetaTag('property', 'og:site_name', 'NeighborLy');

  const currentUrl = meta.url || (typeof window !== 'undefined' ? window.location.href : '');
  if (currentUrl) {
    setMetaTag('property', 'og:url', currentUrl);
  }

  const defaultImage = '/og-image.png';
  const imageUrl = meta.image || defaultImage;
  setMetaTag('property', 'og:image', imageUrl);

  // 4. Twitter / X Card Meta Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', meta.title);
  setMetaTag('name', 'twitter:description', meta.description);
  setMetaTag('name', 'twitter:image', imageUrl);

  // 5. Canonical Link Tag
  if (currentUrl) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);
  }
}
