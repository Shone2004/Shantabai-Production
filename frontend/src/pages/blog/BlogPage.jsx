import React, { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: 'easeOut' },
  }),
};

const CATEGORIES = ['All', 'Food Stories', 'Chef Tips', 'Healthy Eating', 'Cooking Inspiration'];

const POSTS = [
  {
    id: 1,
    category: 'Food Stories',
    title: "How Sunita Tai's Dal Makhani Became a Neighbourhood Legend",
    excerpt:
      'From a small Pune kitchen to feeding over 200 orders a week — the story of a home chef who turned her grandmother\'s recipe into a movement.',
    author: 'Shantabai Team',
    date: 'June 5, 2026',
    readTime: '5 min read',
    emoji: '🍛',
    featured: true,
    color: 'from-amber-50 to-orange-50',
    border: 'border-amber-100',
  },
  {
    id: 2,
    category: 'Chef Tips',
    title: '7 Things Every Home Chef Should Know Before Going Online',
    excerpt:
      'Packaging, pricing, photos, and building trust — a practical guide from Shantabai\'s top-rated cooks.',
    author: 'Priya Nair',
    date: 'May 28, 2026',
    readTime: '7 min read',
    emoji: '👩‍🍳',
    featured: false,
    color: 'from-green-50 to-emerald-50',
    border: 'border-green-100',
  },
  {
    id: 3,
    category: 'Healthy Eating',
    title: 'Why Home-Cooked Meals Beat Restaurant Food Every Time',
    excerpt:
      'Science-backed and stomach-approved: the real nutritional difference between home food and commercial kitchens.',
    author: 'Dr. Meena Iyer',
    date: 'May 20, 2026',
    readTime: '6 min read',
    emoji: '🥗',
    featured: false,
    color: 'from-teal-50 to-cyan-50',
    border: 'border-teal-100',
  },
  {
    id: 4,
    category: 'Cooking Inspiration',
    title: 'Monsoon Comfort: 5 Recipes That Feel Like a Hug',
    excerpt:
      'Khichdi, chai pakoda, warm rasam soup — the dishes our home chefs swear by when the rains arrive.',
    author: 'Kavya Deshmukh',
    date: 'May 15, 2026',
    readTime: '4 min read',
    emoji: '🌧️',
    featured: false,
    color: 'from-blue-50 to-indigo-50',
    border: 'border-blue-100',
  },
  {
    id: 5,
    category: 'Food Stories',
    title: "The Dabba System: India's Original Food Delivery Network",
    excerpt:
      "Long before apps existed, Mumbai's dabbawallas were feeding the city. Shantabai is proud to carry that spirit forward.",
    author: 'Rahul Sharma',
    date: 'May 8, 2026',
    readTime: '8 min read',
    emoji: '🥡',
    featured: false,
    color: 'from-rose-50 to-pink-50',
    border: 'border-rose-100',
  },
  {
    id: 6,
    category: 'Healthy Eating',
    title: 'Eating on a Budget: How to Order Healthy Without Overspending',
    excerpt:
      'Practical tips for students and young professionals who want nutritious home food without the restaurant bill.',
    author: 'Anjali Kulkarni',
    date: 'April 30, 2026',
    readTime: '5 min read',
    emoji: '💰',
    featured: false,
    color: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-100',
  },
  {
    id: 7,
    category: 'Chef Tips',
    title: 'How to Photograph Your Food for Maximum Orders',
    excerpt:
      "You don't need a DSLR. Our top chefs share their smartphone photography secrets for mouthwatering dish photos.",
    author: 'Shantabai Team',
    date: 'April 22, 2026',
    readTime: '6 min read',
    emoji: '📸',
    featured: false,
    color: 'from-purple-50 to-violet-50',
    border: 'border-purple-100',
  },
  {
    id: 8,
    category: 'Cooking Inspiration',
    title: 'Regional Flavours You Should Try Before They Disappear',
    excerpt:
      'From Coorgi pandi curry to Assamese tenga fish — rare regional recipes kept alive by our home chef community.',
    author: 'Neha Bose',
    date: 'April 14, 2026',
    readTime: '9 min read',
    emoji: '🗺️',
    featured: false,
    color: 'from-orange-50 to-red-50',
    border: 'border-orange-100',
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const featured = POSTS.find((p) => p.featured);
  const filtered =
    activeCategory === 'All'
      ? POSTS.filter((p) => !p.featured)
      : POSTS.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">

      {/* Header */}
      <section className="bg-gray-950 text-white pt-24 pb-16 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(27,67,50,0.55) 0%, transparent 70%)' }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="inline-block bg-brand-green/20 text-green-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            Shantabai Blog
          </motion.span>
          <motion.h1
            variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="text-4xl sm:text-5xl font-black leading-tight mb-4">
            Stories from the <span className="text-brand-green">kitchen</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} custom={2} initial="hidden" animate="visible"
            className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
            Tips for home chefs, food stories, healthy eating guides, and the culture of cooking.
          </motion.p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-150 ${
                activeCategory === cat
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Featured Post — only shown on "All" tab */}
        {activeCategory === 'All' && featured && (
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className={`rounded-3xl bg-gradient-to-br ${featured.color} border ${featured.border} p-8 sm:p-10 mb-12 cursor-pointer hover:shadow-lg transition-shadow duration-200`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="text-7xl">{featured.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-brand-green text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    ✨ Featured
                  </span>
                  <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                    {featured.category}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 leading-tight">
                  {featured.title}
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-5">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <span>✍️ {featured.author}</span>
                  <span>📅 {featured.date}</span>
                  <span>⏱ {featured.readTime}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Post Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-medium">
            No posts in this category yet. Check back soon!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                variants={fadeUp} custom={i * 0.1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`rounded-2xl bg-gradient-to-br ${post.color} border ${post.border} p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col`}>
                <span className="text-4xl mb-4 block">{post.emoji}</span>
                <span className="text-brand-green text-xs font-bold uppercase tracking-widest mb-2">
                  {post.category}
                </span>
                <h3 className="font-black text-gray-900 text-base leading-snug mb-2">{post.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium mt-auto pt-3 border-t border-black/5">
                  <span>{post.date}</span>
                  <span className="text-brand-green font-bold">⏱ {post.readTime}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Newsletter CTA */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mt-16 bg-gray-950 rounded-3xl p-8 sm:p-12 text-center">
          <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Stay Updated</span>
          <h3 className="text-2xl font-black text-white mt-2 mb-3">Get stories in your inbox</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            Recipes, chef interviews, and tips — every week, straight to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white/10 border border-white/15 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors duration-150"
            />
            <button className="bg-brand-green text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-green-700 transition-colors duration-150 flex-shrink-0">
              Subscribe
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}