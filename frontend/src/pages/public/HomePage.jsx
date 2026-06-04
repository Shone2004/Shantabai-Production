import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from '../../components/home/Hero.jsx';
import Categories from '../../components/home/Categories.jsx';
import SectionHeader from '../../components/home/SectionHeader.jsx';
import FoodCard from '../../components/food/FoodCard.jsx';
import CookCard from '../../components/home/CookCard.jsx';
import ProviderCTA from '../../components/home/ProviderCTA.jsx';

export default function HomePage() {

  // Mock Foods for Popular Section
  const mockFoods = [
    {
      id: 'f4',
      name: 'Poha',
      price: 40,
      pricePer: 'per plate',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
      description: 'Soft and light poha with peanuts, curry leaves, lemon and mild spices.',
      availabilityDetails: { isAvailable: true, ordersToday: 7, left: 7, total: 15 },
      timeWindow: '9:00 - 10:00 AM',
      location: 'Baner, Pune',
      distance: '1.2 km away',
      tags: ['Veg', 'Healthy', 'Homemade'],
      provider: {
        name: 'Sunita\'s Kitchen',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
        rating: 4.8,
        ordersCount: '120+',
        isVerified: true,
        badges: [
          { icon: 'shield', title: 'Hygienic', subtitle: 'Kitchen' },
          { icon: 'users', title: '100+', subtitle: 'Happy Customers' },
          { icon: 'medal', title: 'Top Rated', subtitle: 'Home Cook' }
        ]
      }
    },
    {
      id: 'f1',
      name: 'Aai\'s Veg Thali',
      price: 99,
      pricePer: 'per plate',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
      description: 'Authentic Maharashtrian vegetarian thali with 2 sabzis, dal, rice, and chapatis.',
      availabilityDetails: { isAvailable: true, ordersToday: 12, left: 3, total: 20 },
      timeWindow: '12:30 - 2:00 PM',
      location: 'Kothrud, Pune',
      distance: '2.5 km away',
      tags: ['Veg', 'Authentic', 'Homemade'],
      provider: {
        name: 'Aai\'s Kitchen',
        avatar: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=150',
        rating: 4.9,
        ordersCount: '500+',
        isVerified: true,
        badges: [
          { icon: 'shield', title: 'Hygienic', subtitle: 'Kitchen' },
          { icon: 'users', title: '400+', subtitle: 'Happy Customers' },
          { icon: 'medal', title: 'Top Rated', subtitle: 'Home Cook' }
        ]
      }
    },
    {
      id: 'f9',
      name: 'Misal Pav',
      price: 60,
      pricePer: 'per plate',
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800',
      description: 'Spicy sprouted moth bean curry served with fresh pav, topped with farsan and chopped onions.',
      availabilityDetails: { isAvailable: true, ordersToday: 24, left: 2, total: 30 },
      timeWindow: '8:30 - 11:00 AM',
      location: 'Katraj, Pune',
      distance: '4.2 km away',
      tags: ['Veg', 'Spicy', 'Street Food'],
      provider: {
        name: 'Ramesh\'s Misal',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
        rating: 4.8,
        ordersCount: '300+',
        isVerified: true,
        badges: [
          { icon: 'shield', title: 'Hygienic', subtitle: 'Kitchen' },
          { icon: 'users', title: '150+', subtitle: 'Happy Customers' },
          { icon: 'medal', title: 'Top Rated', subtitle: 'Local Legend' }
        ]
      }
    },
    {
      id: 'f10',
      name: 'Sabudana Khichdi',
      price: 50,
      pricePer: 'per plate',
      image: 'https://images.unsplash.com/photo-1626074964464-f6df4149dc8c?w=800',
      description: 'Soft tapioca pearls cooked with crushed peanuts, potatoes, and cumin. Perfect for fasting.',
      availabilityDetails: { isAvailable: true, ordersToday: 18, left: 5, total: 25 },
      timeWindow: '9:00 - 12:00 PM',
      location: 'Deccan, Pune',
      distance: '2.1 km away',
      tags: ['Veg', 'Fasting', 'Healthy'],
      provider: {
        name: 'Smita\'s Fasting Foods',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        rating: 4.6,
        ordersCount: '90+',
        isVerified: true,
        badges: [
          { icon: 'shield', title: 'Clean', subtitle: 'Kitchen' },
          { icon: 'users', title: '80+', subtitle: 'Happy Customers' },
          { icon: 'medal', title: 'Specialist', subtitle: 'Home Cook' }
        ]
      }
    }
  ];

  const trendingFoods = [
    {
      id: 'f2',
      name: 'Chicken Curry & Rice',
      price: 129,
      pricePer: 'per plate',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800',
      description: 'Spicy and flavorful chicken curry served with steamed basmati rice.',
      availabilityDetails: { isAvailable: true, ordersToday: 5, left: 5, total: 10 },
      timeWindow: '1:00 - 3:00 PM',
      location: 'Baner, Pune',
      distance: '1.5 km away',
      tags: ['Non-Veg', 'Spicy', 'Homemade'],
      provider: {
        name: 'Zaika Ghar Ka',
        avatar: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150',
        rating: 4.7,
        ordersCount: '80+',
        isVerified: true,
        badges: [
          { icon: 'shield', title: 'Hygienic', subtitle: 'Kitchen' },
          { icon: 'users', title: '50+', subtitle: 'Happy Customers' },
          { icon: 'medal', title: 'Rising Star', subtitle: 'Home Cook' }
        ]
      }
    },
    {
      id: 'f3',
      name: 'Puran Poli (2 Pcs)',
      price: 79,
      pricePer: 'per pair',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      description: 'Sweet, melt-in-mouth puran polis stuffed with chana dal and jaggery.',
      availabilityDetails: { isAvailable: false, ordersToday: 15, left: 0, total: 15 },
      timeWindow: '4:00 - 6:00 PM',
      location: 'Shivajinagar, Pune',
      distance: '3.1 km away',
      tags: ['Veg', 'Sweet', 'Festival'],
      provider: {
        name: 'Asha\'s Kitchen',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
        rating: 4.9,
        ordersCount: '250+',
        isVerified: true,
        badges: [
          { icon: 'shield', title: 'Hygienic', subtitle: 'Kitchen' },
          { icon: 'users', title: '200+', subtitle: 'Happy Customers' },
          { icon: 'medal', title: 'Top Rated', subtitle: 'Home Cook' }
        ]
      }
    },
    {
      id: 'f11',
      name: 'Fish Fry Thali',
      price: 180,
      pricePer: 'per thali',
      image: 'https://images.unsplash.com/photo-1626200419109-383842cb36a0?w=800',
      description: 'Crispy rava fried fish served with solkadhi, rice, and bhakri.',
      availabilityDetails: { isAvailable: true, ordersToday: 4, left: 6, total: 10 },
      timeWindow: '1:00 - 3:30 PM',
      location: 'Kothrud, Pune',
      distance: '3.5 km away',
      tags: ['Non-Veg', 'Seafood', 'Authentic'],
      provider: {
        name: 'Konkani Katta',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        rating: 4.7,
        ordersCount: '110+',
        isVerified: true,
        badges: [
          { icon: 'shield', title: 'Hygienic', subtitle: 'Kitchen' },
          { icon: 'users', title: '90+', subtitle: 'Happy Customers' },
          { icon: 'medal', title: 'Top Rated', subtitle: 'Seafood Cook' }
        ]
      }
    },
    {
      id: 'f12',
      name: 'Paneer Tikka Masala',
      price: 140,
      pricePer: 'per portion',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
      description: 'Charcoal grilled paneer chunks in a rich, creamy tomato gravy.',
      availabilityDetails: { isAvailable: true, ordersToday: 8, left: 12, total: 20 },
      timeWindow: '7:00 - 10:00 PM',
      location: 'Wakad, Pune',
      distance: '5.0 km away',
      tags: ['Veg', 'Rich', 'North Indian'],
      provider: {
        name: 'Punjabi Tadka',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
        rating: 4.5,
        ordersCount: '180+',
        isVerified: false,
        badges: [
          { icon: 'shield', title: 'Clean', subtitle: 'Kitchen' },
          { icon: 'users', title: '120+', subtitle: 'Happy Customers' },
          { icon: 'medal', title: 'Rising Star', subtitle: 'Home Cook' }
        ]
      }
    }
  ];

  const mockCooks = [
    { id: 'c1', name: 'Sunita Kitchen', rating: '4.9', orders: '120', distance: '1.2 km', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400' },
    { id: 'c2', name: 'Asha Meals', rating: '4.8', orders: '98', distance: '1.4 km', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400' },
    { id: 'c3', name: 'Maa Ka Swad', rating: '4.7', orders: '110', distance: '1.6 km', image: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400' },
    { id: 'c4', name: 'Homely Bites', rating: '4.8', orders: '75', distance: '1.7 km', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' },
  ];

  return (
    <div className="bg-white min-h-screen pb-20 overflow-x-hidden">
      <Hero />
      
      <div className="max-w-7xl mx-auto">
        {/* Categories */}
        <SectionHeader title="Categories" showSeeAll={true} link="/food" />
        <Categories />

        {/* Popular Near You */}
        <div className="mt-6">
          <SectionHeader title="Popular Near You" showSeeAll={true} link="/food" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 px-4 sm:px-6 lg:px-8 mt-10 pb-16">
            {mockFoods.map((food, idx) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: idx * 0.1 }}
                className="flex justify-center w-full"
              >
                <FoodCard food={food} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trending Today */}
        <div className="mt-8 bg-gray-50 py-10 rounded-[3rem] mx-2 sm:mx-6 lg:mx-8 mb-8 border border-gray-100">
          <SectionHeader title="Trending Today 🔥" showSeeAll={true} link="/food" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 px-4 sm:px-6 lg:px-8 mt-10 pb-8">
            {trendingFoods.map((food, idx) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: idx * 0.1 }}
                className="flex justify-center w-full"
              >
                <FoodCard food={food} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Nearby Home Cooks */}
        <div className="mt-16">
          <SectionHeader title="Nearby Home Cooks" link="/search" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">
            {mockCooks.map((cook, idx) => (
              <motion.div
                key={cook.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <CookCard cook={cook} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Provider CTA */}
        <ProviderCTA />

      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-gray-900 text-white py-16 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-8">
          <div className="col-span-1 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xl font-bold">Shantabai</span>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering home chefs and bringing fresh, healthy, and affordable meals to your doorstep.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/about" className="hover:text-brand-orange transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-brand-orange transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-brand-orange transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/privacy" className="hover:text-brand-orange transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-orange transition-colors">Terms of Service</Link></li>
              <li><Link to="/faq" className="hover:text-brand-orange transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-orange transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-orange transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm">
          <p>© 2026 Shantabai. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
}
