import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const WHY_ITEMS = [
  {
    emoji: '🏠',
    title: 'Real Home Kitchens',
    desc: 'Every meal is prepared in a verified home kitchen, not a factory. You taste the difference.',
  },
  {
    emoji: '🥗',
    title: 'Fresh & Transparent',
    desc: 'Seasonal ingredients, no preservatives. Chefs list every dish with full details so you know exactly what you eat.',
  },
  {
    emoji: '💚',
    title: 'Community First',
    desc: 'Your order directly supports a family in your neighbourhood. No middlemen, maximum impact.',
  },
  {
    emoji: '⭐',
    title: 'Quality Guaranteed',
    desc: 'Every chef goes through our verification process. Real ratings from real customers keep standards high.',
  },
];

const IMPACT = [
  { value: '500+',    label: 'Home Chefs Empowered', emoji: '👩‍🍳' },
  { value: '10,000+', label: 'Meals Delivered',       emoji: '🍱' },
  { value: '12+',     label: 'Neighbourhoods Served', emoji: '📍' },
  { value: '4.8',     label: 'Average Rating',        emoji: '⭐' },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">

      {/* Hero */}
      <section className="bg-gray-950 text-white pt-24 pb-20 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(27,67,50,0.55) 0%, transparent 70%)' }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="inline-block bg-brand-green/20 text-green-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            Our Story
          </motion.span>
          <motion.h1
            variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="text-4xl sm:text-5xl font-black leading-tight mb-5">
            Food made with love,<br />
            <span className="text-brand-green">delivered with care.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} custom={2} initial="hidden" animate="visible"
            className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
            Shantabai connects people who miss ghar ka khana with talented home chefs
            who pour their heart into every meal.
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-14 items-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="text-brand-green font-bold text-sm uppercase tracking-widest">Our Story</span>
          <h2 className="text-3xl font-black text-gray-900 mt-2 mb-5 leading-snug">
            It started with a simple question:<br />
            <em className="not-italic text-brand-green">"Whose food do you miss most?"</em>
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            In 2026, our founders noticed a gap: thousands of talented home cooks across
            India's cities were feeding their own families incredible food, while just a
            few floors away, working professionals and students were eating processed meals
            and missing home.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Shantabai was born to bridge that gap — a marketplace where anyone can discover
            a trustworthy home chef nearby and get the kind of food that actually makes you feel good.
          </p>
        </motion.div>
        <motion.div
          variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="bg-gradient-to-br from-brand-green/10 to-green-50 rounded-3xl p-10 flex flex-col gap-6">
          {[
            '🍲 Reconnecting people to real, home-cooked food.',
            '👩‍🍳 Giving talented home chefs a sustainable income.',
            '🏘️ Strengthening local communities, one meal at a time.',
          ].map((line) => (
            <div key={line} className="flex items-start gap-3">
              <span className="text-2xl leading-tight">{line.split(' ')[0]}</span>
              <p className="text-gray-700 font-medium text-sm leading-relaxed">
                {line.split(' ').slice(1).join(' ')}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Mission */}
      <section className="bg-brand-green py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
            Our Mission
          </motion.h2>
          <motion.p
            variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-green-100 text-xl leading-relaxed font-medium">
            "Connecting people with homemade food and empowering home chefs."
          </motion.p>
          <motion.p
            variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-green-200 text-sm mt-5 leading-relaxed max-w-lg mx-auto">
            We believe food is more than nutrition — it's culture, memory, and belonging.
            Every order on Shantabai preserves a recipe, supports a family, and reminds someone of home.
          </motion.p>
        </div>
      </section>

      {/* Why Choose Shantabai */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="text-brand-green font-bold text-sm uppercase tracking-widest">Why Shantabai</span>
          <h2 className="text-3xl font-black text-gray-900 mt-2">What makes us different</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {WHY_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp} custom={i * 0.5} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-brand-green/40 hover:shadow-md transition-all duration-200">
              <span className="text-3xl mb-4 block">{item.emoji}</span>
              <h3 className="font-black text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Impact */}
      <section className="bg-gray-950 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-green-400 font-bold text-sm uppercase tracking-widest">Community Impact</span>
            <h2 className="text-3xl font-black text-white mt-2">Growing together</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {IMPACT.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp} custom={i * 0.1} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-center bg-white/5 rounded-2xl p-6 border border-white/8">
                <span className="text-3xl block mb-2">{stat.emoji}</span>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-gray-400 text-xs font-medium mt-1 leading-tight">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-green py-14 px-4 text-center">
        <h2 className="text-2xl font-black text-white mb-4">Ready to taste the difference?</h2>
        <p className="text-green-100 text-sm mb-7 max-w-sm mx-auto">
          Find a home chef near you and enjoy a meal that actually feels like home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/food"
            className="bg-white text-brand-green font-bold px-7 py-3 rounded-xl text-sm hover:bg-green-50 transition-colors duration-150">
            Browse Food
          </Link>
          <Link to="/contact"
            className="bg-transparent border-2 border-white text-white font-bold px-7 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors duration-150">
            Get in Touch
          </Link>
        </div>
      </section>

    </div>
  );
}