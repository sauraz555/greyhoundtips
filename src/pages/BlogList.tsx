import { Link } from 'react-router-dom';
import { ArrowRight, Clock, PawPrint } from 'lucide-react';
import Footer from '@/components/Footer';
import { blogPosts } from '@/lib/blogPosts';

export default function BlogList() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
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
          <Link to="/" className="btn-ghost text-sm">
            Back to home
          </Link>
        </div>
        <div className="dog-track" />
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-amber-600">
            Engineering Blog
          </span>
          <h1 className="mt-2 font-display text-4xl tracking-wide text-ink-900 sm:text-5xl">
            THE <span className="text-gradient-amber">SCIENCE</span> BEHIND THE MODEL
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-ink-600">
            Technical deep-dives into the data pipelines, machine learning architectures, and
            quantitative methods that power Greyhound Edge's race predictions.
          </p>
        </div>

        {/* Blog post cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {blogPosts.map((post, i) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className={`card card-hover overflow-hidden p-0 animate-fadeInUp stagger-${Math.min(i + 1, 5)}`}
            >
              {/* Hero image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={post.heroImage}
                  alt={post.heroAlt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-900 shadow-md">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-ink-500">
                  <span>{post.date}</span>
                  <span className="text-ink-300">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-lg leading-snug tracking-wide text-ink-900 group-hover:text-amber-600 transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600 line-clamp-3">
                  {post.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 group-hover:text-amber-500 transition-colors">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
