import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  jsonLd?: object | object[];
  noIndex?: boolean;
}

const SITE_URL = 'https://greyhoundedge.com';
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/36314925/pexels-photo-36314925.jpeg?auto=compress&cs=tinysrgb&w=1200';
const DEFAULT_IMAGE_ALT = 'Greyhound Edge — Australian greyhound racing predictions and form analysis dashboard';

const DEFAULT_TITLE = 'Greyhound Edge — Australian Greyhound Racing Predictions, Tips & Form Analysis';
const DEFAULT_DESCRIPTION = 'Free daily model-generated greyhound racing tips and predictions for Australian tracks. Probable winners, confidence ratings, false-favourite detection, and speed maps. 18+. Not betting advice.';
const DEFAULT_KEYWORDS = 'greyhound racing tips, greyhound predictions, Australian greyhound racing, greyhound form analysis, greyhound betting tips, dog racing tips Australia, greyhound racing model, probable winners greyhound, false favourite greyhound, speed maps greyhound, greyhound racing picks, Wentworth Park tips, Sandown greyhound tips, Angle Park tips, The Meadows greyhound, greyhound racing statistics, greyhound racing data, greyhound racing analytics, greyhound racing AI, machine learning greyhound racing, greyhound racing free tips, daily greyhound tips';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id: string, data: object | object[]) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath = '/',
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  ogImageAlt = DEFAULT_IMAGE_ALT,
  jsonLd,
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    const fullUrl = `${SITE_URL}${canonicalPath}`;

    document.title = title;
    setMeta('name', 'title', title);
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setLink('canonical', fullUrl);

    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:url', fullUrl);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:image:alt', ogImageAlt);
    setMeta('property', 'og:site_name', 'Greyhound Edge');
    setMeta('property', 'og:locale', 'en_AU');

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);
    setMeta('name', 'twitter:image:alt', ogImageAlt);

    if (jsonLd) {
      setJsonLd('page-jsonld', jsonLd);
    } else {
      removeJsonLd('page-jsonld');
    }

    return () => {
      removeJsonLd('page-jsonld');
    };
  }, [title, description, keywords, canonicalPath, ogType, ogImage, ogImageAlt, jsonLd, noIndex]);

  return null;
}
