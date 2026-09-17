import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Clock, PawPrint, AlertCircle,
} from 'lucide-react';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { getPostBySlug, blogPosts } from '@/lib/blogPosts';
import type { BlogSection } from '@/lib/blogPosts';

function renderSection(section: BlogSection, idx: number) {
  switch (section.type) {
    case 'heading':
      return (
        <h2
          key={idx}
          className="mt-10 mb-4 font-display text-2xl tracking-wide text-ink-900 scroll-mt-20"
        >
          {section.content}
        </h2>
      );

    case 'subheading':
      return (
        <h3
          key={idx}
          className="mt-6 mb-3 font-display text-lg tracking-wide text-ink-800"
        >
          {section.content}
        </h3>
      );

    case 'paragraph':
      return (
        <p key={idx} className="mb-4 text-[15px] leading-relaxed text-ink-700">
          {section.content}
        </p>
      );

    case 'list':
      return (
        <ul key={idx} className="mb-4 space-y-2 pl-1">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-700">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'table':
      return (
        <div key={idx} className="mb-4 overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-600">
                {section.headers?.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows?.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-ink-100 transition-colors hover:bg-amber-50/30 last:border-b-0"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 ${
                        j === 0 ? 'font-semibold text-ink-900' : 'text-ink-600'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'code':
      return (
        <pre
          key={idx}
          className="mb-4 overflow-x-auto rounded-xl border border-ink-700 bg-ink-900 p-4"
        >
          <code className="mono text-sm leading-relaxed text-amber-300 whitespace-pre">
            {section.content}
          </code>
        </pre>
      );

    case 'callout':
      return (
        <div
          key={idx}
          className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <p className="text-sm leading-relaxed text-amber-800">{section.content}</p>
        </div>
      );

    case 'image':
      return (
        <figure key={idx} className="mb-6">
          <div className="overflow-hidden rounded-xl border border-ink-200 shadow-sm">
            <img
              src={section.image}
              alt={section.alt ?? ''}
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
          {section.caption && (
            <figcaption className="mt-2 text-center text-xs text-ink-500 italic">
              {section.caption}
            </figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col bg-ink-50">
        <header className="sticky top-0 z-40 border-b border-ink-200 bg-ink-50/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link to="/" className="group flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/20 transition-transform group-hover:scale-110">
                <PawPrint className="h-5 w-5 text-ink-900" />
              </div>
              <span className="font-display text-xl tracking-wide text-ink-900">
                GREYHOUND<span className="text-amber-500">EDGE</span>
              </span>
            </Link>
            <Link to="/blog" className="btn-ghost text-sm">
              Back to blog
            </Link>
          </div>
        </header>
        <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <p className="font-display text-2xl tracking-wide text-ink-900">Article not found</p>
          <Link to="/blog" className="btn-secondary mt-6">
            Back to blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const otherPosts = blogPosts.filter((p) => p.slug !== post.slug);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.heroImage,
    datePublished: '2026-09-17',
    dateModified: '2026-09-17',
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Greyhound Edge',
      url: 'https://greyhoundedge.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://greyhoundedge.com/blog/${post.slug}`,
    },
    keywords: post.category,
    inLanguage: 'en-AU',
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <SEO
        title={`${post.title} | Greyhound Edge Blog`}
        description={post.excerpt}
        keywords={`greyhound racing, ${post.category}, greyhound racing tips, greyhound form analysis, Australian greyhound racing, greyhound racing predictions, ${post.title}`}
        canonicalPath={`/blog/${post.slug}`}
        ogType="article"
        ogImage={post.heroImage}
        ogImageAlt={post.heroAlt}
        jsonLd={articleJsonLd}
      />
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-ink-50/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/20 transition-transform group-hover:scale-110">
              <PawPrint className="h-5 w-5 text-ink-900" />
            </div>
            <span className="font-display text-xl tracking-wide text-ink-900">
              GREYHOUND<span className="text-amber-500">EDGE</span>
            </span>
          </Link>
          <Link to="/blog" className="btn-ghost text-sm">
            All articles
          </Link>
        </div>
        <div className="dog-track" />
      </header>

      {/* Hero image */}
      <div className="relative h-64 overflow-hidden sm:h-80 lg:h-96">
        <img
          src={post.heroImage}
          alt={post.heroAlt}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-3xl px-4 pb-6">
          <span className="inline-block rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-900 shadow-md">
            {post.category}
          </span>
          <h1 className="mt-3 font-display text-2xl leading-tight tracking-wide text-ink-50 sm:text-3xl lg:text-4xl">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Article body */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
        {/* Meta row */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-ink-500">
          <span className="font-medium text-ink-700">{post.author}</span>
          <span className="text-ink-300">·</span>
          <span>{post.date}</span>
          <span className="text-ink-300">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>

        {/* Excerpt */}
        <p className="mb-8 border-l-4 border-amber-500 pl-4 text-lg leading-relaxed text-ink-700 italic">
          {post.excerpt}
        </p>

        {/* Sections */}
        <article>{post.sections.map((s, i) => renderSection(s, i))}</article>

        {/* Disclaimer */}
        <div className="mt-10 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            <span className="font-semibold">Model output — not financial or betting advice.</span>{' '}
            This article describes technical methodology for informational purposes only. No outcome
            is guaranteed. Please gamble responsibly. 18+ only.
          </span>
        </div>

        {/* Back link */}
        <Link to="/blog" className="btn-ghost mt-6 -ml-2 text-sm group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to all articles
        </Link>

        {/* Other articles */}
        {otherPosts.length > 0 && (
          <div className="mt-12 border-t border-ink-200 pt-8">
            <h3 className="mb-4 font-display text-lg tracking-wide text-ink-900">
              MORE ARTICLES
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {otherPosts.map((other) => (
                <Link
                  key={other.slug}
                  to={`/blog/${other.slug}`}
                  className="card card-hover group overflow-hidden p-0"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={other.heroImage}
                      alt={other.heroAlt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                      {other.category}
                    </span>
                    <h4 className="mt-1.5 font-display text-sm leading-snug tracking-wide text-ink-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {other.title}
                    </h4>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                      Read
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
