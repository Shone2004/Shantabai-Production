import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';

// Import Reusable Elements
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import IconLabel from '../../components/IconLabel.jsx';
import ProviderSidebar from '../../components/ProviderSidebar.jsx';

// Import Reusable Layouts
import TwoColumnLayout from '../../layouts/TwoColumnLayout.jsx';

export default function ProviderProfile() {
  const { id } = useParams();
  const { user, isMock } = useAuth();
  const navigate = useNavigate();
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Booking Form State
  const [address, setAddress] = useState('');
  const [meals, setMeals] = useState({ breakfast: false, lunch: true, dinner: true });
  const [dietary, setDietary] = useState('veg');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('30-days');

  // Service details mapping for premium professional view
  const serviceDetails = {
    'Daily Kitchen Visits': {
      title: 'Daily Kitchen Visits',
      desc: 'Twice-daily home visits to prepare fresh, piping hot meals right at your kitchen counter.',
      icon: 'meal'
    },
    'Daily Home Meals': {
      title: 'Daily Home Meals',
      desc: 'Nutritious everyday home cooking prepared with customized oil and spice ratios.',
      icon: 'meal'
    },
    'Weekend Tiffin Delivery': {
      title: 'Weekend Tiffin Delivery',
      desc: 'Hygienic, spill-proof lunch boxes delivered straight to your home or office.',
      icon: 'diet'
    },
    'Daily Tiffin Delivery': {
      title: 'Daily Tiffin Delivery',
      desc: 'Regular, healthy tiffin preps optimized for students and busy working professionals.',
      icon: 'diet'
    },
    'Party Catering': {
      title: 'Party Catering',
      desc: 'Gourmet, fine-dining multi-course spreads designed for birthdays, anniversaries, and gatherings.',
      icon: 'verified'
    },
    'Gourmet Seafood Catering': {
      title: 'Gourmet Seafood Catering',
      desc: 'Exquisite, fresh coastal seafood preparation tailored for luxury parties.',
      icon: 'verified'
    },
    'Special Festival Sweets': {
      title: 'Special Festival Sweets',
      desc: 'Authentic traditional sweets and festival delicacies prepared with pure desi ghee.',
      icon: 'time'
    },
    'Diet Consultations': {
      title: 'Diet Consultations',
      desc: 'Personalized meal scheduling and micro-nutrient tracking for health goals.',
      icon: 'diet'
    },
    'Festival Feasts': {
      title: 'Festival Feasts',
      desc: 'Authentic, pure vegetarian custom menus prepared strictly according to traditional guidelines.',
      icon: 'time'
    },
    'Custom Weight-Loss Preps': {
      title: 'Custom Weight-Loss Preps',
      desc: 'Calorie-counted, high-protein meal preparation for active fitness routines.',
      icon: 'diet'
    },
    'Diabetic-friendly cooking': {
      title: 'Diabetic-friendly cooking',
      desc: 'Specialized low-glycemic everyday meals prepared with wholesome grains.',
      icon: 'diet'
    },
    'Private Chef Services': {
      title: 'Private Chef Services',
      desc: 'Dedicated culinary expert available for private in-house dining and live cooking.',
      icon: 'meal'
    },
    'Italian Fusion Dinners': {
      title: 'Italian Fusion Dinners',
      desc: 'Premium Italian recipes customized with subtle local herbs and spice highlights.',
      icon: 'verified'
    },
    'Private Party Cooking': {
      title: 'Private Party Cooking',
      desc: 'Live counters and custom courses prepared at your venue for up to 25 guests.',
      icon: 'verified'
    },
    'Continental Evenings': {
      title: 'Continental Evenings',
      desc: 'Elegant Western menus featuring fresh roasts, pastas, salads, and fresh bakes.',
      icon: 'meal'
    }
  };

  // Mocks matching the catchy style exactly
  const mockChefs = {
    'mock-uuid-chef-1': {
      id: 'mock-uuid-chef-1',
      name: 'Sunita Home Chef',
      specialty: 'North Indian, Mughlai, Traditional gravies',
      experience: '10+ Years Exp',
      rating: 4.9,
      reviewsCount: 120,
      rate: 150,
      location: 'Connaught Place, New Delhi',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
      description: 'Specialist in authentic Punjabi cuisine and Slow-Cooked Mughlai gravies. Ex-restaurant head chef. I emphasize fresh ingredients, traditional spices ground from scratch, and light, digestible home cooking styles.',
      subscription_tier: 'premium',
      services: ['Daily Kitchen Visits', 'Weekend Tiffin Delivery', 'Party Catering', 'Special Festival Sweets'],
      menu: {
        appetizers: [
          { name: 'Paneer Tikka Angare', desc: 'Smoked paneer chunks in house spices', img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200' },
          { name: 'Dahi Ke Sholay', desc: 'Crispy fried bread rolls stuffed with spiced yogurt', img: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=200' }
        ],
        mains: [
          { name: 'Dal Makhani Bukhara', desc: '24-hour slow-cooked black lentils in churned butter', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200' },
          { name: 'Shahi Paneer Lazeez', desc: 'Cottage cheese cubes in rich cashew-tomato gravy', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200' }
        ],
        desserts: [
          { name: 'Kesari Phirni', desc: 'Chilled ground rice pudding with saffron and dry fruits', img: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=200' },
          { name: 'Gulab Jamun Rabri', desc: 'Warm cottage cheese dumplings over sweet condensed milk', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200' }
        ]
      },
      areas: ['Connaught Place', 'Sector 62 Gurgaon', 'Vasant Kunj', 'Saket', 'Noida Sector 15'],
      reviews: [
        { name: 'Sanjay Dutt', rating: 5, date: '2 days ago', text: 'Amazing Dal Makhani! Unbelievable home taste and extremely hygienic prep.' },
        { name: 'Kiran G.', rating: 4.8, date: '1 week ago', text: 'Punctual, polite, and very neat. Sunita customized spices exactly to our taste.' }
      ]
    },
    'mock-uuid-chef-2': {
      id: 'mock-uuid-chef-2',
      name: "Meena's Tiffin Service",
      specialty: 'Maharashtrian, Konkani, Tiffin meals',
      experience: '5+ Years Exp',
      rating: 4.8,
      reviewsCount: 95,
      rate: 120,
      location: 'Andheri West, Mumbai',
      avatar: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400',
      description: 'Passionate home cook providing healthy, oil-free daily meals. Expert in regional Maharashtrian dishes. I specialize in customized weight-loss meal preps and heart-healthy dietary schedules.',
      subscription_tier: 'free',
      services: ['Daily Tiffin Delivery', 'Weight-Loss Custom Meals', 'Traditional Festival Catering'],
      menu: {
        appetizers: [
          { name: 'Kothimbir Vadi', desc: 'Steamed and fried coriander cakes', img: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=200' }
        ],
        mains: [
          { name: 'Puran Poli with Katachi Amti', desc: 'Sweet lentils flatbread with spicy regional broth', img: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=200' }
        ],
        desserts: [
          { name: 'Ukdiche Modak', desc: 'Steamed rice flour dumplings stuffed with coconut jaggery', img: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=200' }
        ]
      },
      areas: ['Andheri West', 'Bandra', 'Juhu', 'Goregaon', 'Vile Parle'],
      reviews: [
        { name: 'Megha S.', rating: 5, date: '3 days ago', text: 'Her Modaks are absolutely divine! Healthy, tasty daily food.' }
      ]
    },
    'mock-uuid-chef-3': {
      id: 'mock-uuid-chef-3',
      name: 'Latha Cook',
      specialty: 'South Indian, Traditional, Seafood specialties',
      experience: '8+ Years Exp',
      rating: 4.7,
      reviewsCount: 88,
      rate: 140,
      location: 'Panaji, Goa',
      avatar: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400',
      description: 'Specializes in fine-dining party catering and sea-food delicacies. Over 12 years of luxury resort experience.',
      subscription_tier: 'premium',
      services: ['Gourmet Seafood Catering', 'Private Party Cooking', 'Continental Evenings'],
      menu: {
        appetizers: [
          { name: 'Peri-Peri Prawns', desc: 'Spiced fiery pan-seared prawns', img: 'https://images.unsplash.com/photo-1559742811-824289511f48?w=200' }
        ],
        mains: [
          { name: 'Goan Fish Curry & Rice', desc: 'Traditional coconut tamarind fish curry', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200' }
        ],
        desserts: [
          { name: 'Bebinca', desc: 'Layered Goan coconut pudding', img: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=200' }
        ]
      },
      areas: ['Panaji', 'Candolim', 'Calangute', 'Margao', 'Mapusa'],
      reviews: [
        { name: 'David M.', rating: 5, date: '2 weeks ago', text: 'Catered our anniversary party. The seafood platter and pasta were world-class!' }
      ]
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    if (isMock) {
      const selected = mockChefs[id] || mockChefs['mock-uuid-chef-1'];
      setChef(selected);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/providers/${id}`);
      if (res.data) {
        const specialty = res.data.specialty || 'Indian Home Cook';
        const rawServices = res.data.services || ['Daily Kitchen Visits', 'Weekend Tiffin', 'Party Catering'];
        const rawMenu = res.data.menu || {
          appetizers: [
            { name: 'Paneer Tikka', desc: 'Spiced cottage cheese tikka', img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200' }
          ],
          mains: [
            { name: 'Dal Makhani', desc: 'Creamy slow-cooked lentils', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200' },
            { name: 'Paneer Butter Masala', desc: 'Sweet-spicy buttery paneer', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200' }
          ],
          desserts: [
            { name: 'Gulab Jamun', desc: 'Sweet sugar syrup dumplings', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200' }
          ]
        };
        const rawAreas = res.data.areas || [res.data.location || 'Local Sector Area'];
        
        setChef({
          id: res.data.id,
          name: res.data.name || 'Professional Chef Partner',
          specialty: specialty,
          experience: res.data.experience || '5+ Years Exp',
          rating: res.data.rating || 4.8,
          reviewsCount: res.data.reviews?.length || 42,
          rate: res.data.rate || 150,
          location: res.data.location || 'Local Area',
          avatar: res.data.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
          description: res.data.description || 'Specialized kitchen partner dedicated to serving healthy, flavorful and hygienic food directly at your home.',
          subscription_tier: res.data.subscription_tier || 'free',
          services: rawServices,
          menu: rawMenu,
          areas: rawAreas,
          reviews: res.data.reviews || [
            { name: 'Happy Client', rating: 5, date: '1 month ago', text: 'Exceptional hygiene and delicious, home-like taste.' }
          ]
        });
      }
    } catch (err) {
      console.warn("Failed to load provider profile:", err.message);
      const selected = mockChefs[id] || mockChefs['mock-uuid-chef-1'];
      setChef(selected);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, isMock]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingSuccess(true);

    if (isMock) {
      setTimeout(() => {
        setBookingModalOpen(false);
        setBookingSuccess(false);
        navigate('/customer/bookings');
      }, 1500);
      return;
    }

    try {
      const selectedMeals = Object.keys(meals).filter(k => meals[k]).join(', ');
      await api.post('/bookings', {
        chef_id: id,
        start_date: startDate,
        duration: duration,
        meals: selectedMeals || 'Lunch, Dinner',
        dietary: dietary,
        address: address
      });

      setTimeout(() => {
        setBookingModalOpen(false);
        setBookingSuccess(false);
        navigate('/customer/bookings');
      }, 1500);
    } catch (err) {
      console.error("Booking error:", err.message);
      alert(err.response?.data?.error || "Failed to finalize booking.");
      setBookingSuccess(false);
    }
  };

  const [activeMenuTab, setActiveMenuTab] = useState('mains');

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex justify-center items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  if (!chef) return null;

  return (
    <div className="bg-brand-cream min-h-screen pb-16 text-brand-brown antialiased">
      {/* Navbar with subtle shadow */}
      <nav className="bg-white border-b border-brand-beige py-4 mb-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Shanta Bai Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-brand-brown">Shanta Bai</span>
          </Link>
          <Link to="/search" className="text-sm font-semibold text-brand-orange hover:text-brand-orange/80">
            Back to Search
          </Link>
        </div>
      </nav>

      {/* 1. Cover Section */}
      <div className="relative h-72 sm:h-96 bg-gradient-to-r from-brand-orange/95 via-brand-orange to-brand-green/80 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200')] bg-cover bg-center mix-blend-overlay opacity-35"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-brand-yellow/20 rounded-full filter blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-5 left-1/4 w-80 h-80 bg-brand-green/30 rounded-full filter blur-[100px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Availability Active indicator */}
        <div className="absolute bottom-28 left-4 sm:left-12 flex items-center space-x-2.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-ping"></span>
          <span className="h-2 w-2 rounded-full bg-green-500 absolute left-4"></span>
          <span className="pl-1">Available for Booking Today</span>
        </div>
      </div>

      {/* 2. Structured TwoColumnLayout wrapper to balance whitespace and eliminate empty borders */}
      <div className="relative z-10 -mt-24 sm:-mt-32">
        <TwoColumnLayout 
          sidebar={
            <ProviderSidebar 
              chef={chef} 
              onBookClick={() => setBookingModalOpen(true)} 
            />
          }
        >
          {/* Main Column Contents: Details block, about section, services list, signature menus, reviews */}
          <div className="space-y-8">
            
            {/* Header Details Card */}
            <Card className="relative overflow-hidden border border-brand-beige rounded-3xl p-6 sm:p-8 shadow-xl bg-white/95 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative shrink-0">
                  <img
                    src={chef.avatar}
                    alt={chef.name}
                    className="h-28 w-28 sm:h-36 sm:w-36 rounded-[32px] object-cover border-4 border-white shadow-2xl"
                  />
                  {chef.subscription_tier === 'premium' && (
                    <span className="absolute -bottom-2 -right-2 bg-brand-yellow text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white tracking-widest uppercase">
                      Premium
                    </span>
                  )}
                </div>

                <div className="text-center sm:text-left space-y-3 flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-brown tracking-tight leading-none">
                    {chef.name}
                  </h1>
                  
                  <div className="flex items-center justify-center sm:justify-start">
                    <IconLabel type="location" label={chef.location} labelClassName="text-sm font-bold text-brand-orange" />
                  </div>

                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    {chef.specialty}
                  </p>
                </div>
              </div>

              {/* Horizontal statistics Highlights Grid */}
              <div className="grid grid-cols-4 gap-2 pt-6 mt-6 border-t border-brand-beige text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Rating</span>
                  <IconLabel type="star" label={chef.rating} className="justify-center" labelClassName="text-sm font-extrabold text-brand-orange" />
                </div>
                <div className="space-y-0.5 border-l border-brand-beige">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Experience</span>
                  <IconLabel type="experience" label={chef.experience.replace(/[^0-9+]/g, '') + ' Yrs'} className="justify-center" labelClassName="text-sm font-extrabold text-brand-brown" />
                </div>
                <div className="space-y-0.5 border-l border-brand-beige">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Hygiene</span>
                  <IconLabel type="verified" label="Certified" className="justify-center" labelClassName="text-sm font-extrabold text-brand-green" />
                </div>
                <div className="space-y-0.5 border-l border-brand-beige">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Repeats</span>
                  <span className="text-sm font-extrabold text-blue-600 block">92%</span>
                </div>
              </div>
            </Card>

            {/* About Card */}
            <Card className="hover:shadow-md transition-shadow">
              <Card.Header>
                <h2 className="text-lg font-extrabold text-brand-brown border-l-4 border-brand-orange pl-3">About the Culinary Partner</h2>
              </Card.Header>
              <Card.Body className="space-y-4">
                <p className="text-gray-600 leading-relaxed text-sm">{chef.description}</p>
                
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">Signature Cuisine Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {chef.specialty.split(', ').map(spec => (
                      <Badge key={spec} variant="brown" size="sm" outline>
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Detailed Services list */}
            <Card className="hover:shadow-md transition-shadow">
              <Card.Header>
                <h2 className="text-lg font-extrabold text-brand-brown border-l-4 border-brand-orange pl-3">Services Offered</h2>
              </Card.Header>
              <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {chef.services.map((service, idx) => {
                  const details = serviceDetails[service] || {
                    title: service,
                    desc: 'Professional personalized culinary service prepared to meet your spice and health standards.',
                    icon: 'meal'
                  };
                  return (
                    <div 
                      key={idx} 
                      className="group flex gap-4 p-5 bg-white border border-brand-beige rounded-2xl shadow-sm hover:border-brand-orange/30 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="h-10 w-10 shrink-0 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange transition-colors group-hover:bg-brand-orange group-hover:text-white">
                        <IconLabel type={details.icon} label="" iconClassName="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-brand-brown group-hover:text-brand-orange transition-colors">
                          {details.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                          {details.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>

            {/* Signature Menu highlights tab list */}
            <Card className="hover:shadow-md transition-shadow">
              <Card.Header className="flex justify-between items-center flex-wrap gap-3">
                <h2 className="text-lg font-extrabold text-brand-brown border-l-4 border-brand-orange pl-3">Signature Menu Highlights</h2>
                <div className="flex bg-brand-beige/50 p-1.5 rounded-xl gap-1">
                  {Object.keys(chef.menu).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveMenuTab(tab)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                        activeMenuTab === tab 
                          ? 'bg-brand-orange text-white shadow-sm' 
                          : 'text-brand-brown hover:bg-brand-beige'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </Card.Header>
              <Card.Body className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {chef.menu[activeMenuTab]?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-3 bg-brand-cream border border-brand-beige/65 rounded-2xl hover:border-brand-orange/30 transition-colors">
                    <img 
                      src={item.img} 
                      alt={item.name} 
                      className="h-16 w-16 rounded-xl object-cover border border-brand-beige/50 shadow-sm shrink-0" 
                    />
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-brand-brown truncate">{item.name}</h4>
                        <Badge variant="orange" size="sm" className="scale-75 origin-right">Best</Badge>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* Service Localities covered */}
            <Card className="hover:shadow-md transition-shadow">
              <Card.Header>
                <h2 className="text-lg font-extrabold text-brand-brown border-l-4 border-brand-orange pl-3">Service Localities</h2>
              </Card.Header>
              <Card.Body>
                <p className="text-xs text-gray-400 mb-3">Available for home kitchen schedules in the following sectors:</p>
                <div className="flex flex-wrap gap-2">
                  {chef.areas.map((area, idx) => (
                    <span key={idx} className="inline-flex items-center px-3.5 py-2 bg-brand-cream border border-brand-beige text-brand-brown text-xs font-bold rounded-xl hover:border-brand-orange/30 transition-colors">
                      <IconLabel type="location" label={area} labelClassName="text-xs font-bold" />
                    </span>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Customer Reviews Section */}
            <Card className="hover:shadow-md transition-shadow">
              <Card.Header>
                <h2 className="text-lg font-extrabold text-brand-brown border-l-4 border-brand-orange pl-3">Customer Reviews</h2>
              </Card.Header>
              <Card.Body className="divide-y divide-brand-beige space-y-6">
                {chef.reviews.map((rev, index) => (
                  <div key={index} className={`pt-6 ${index === 0 ? 'pt-0' : ''} space-y-2.5`}>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-extrabold text-brand-brown">{rev.name}</span>
                      <span className="text-gray-400 text-xs">{rev.date}</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`h-4 w-4 shrink-0 ${i < Math.floor(rev.rating) ? 'text-brand-yellow' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </div>
        </TwoColumnLayout>
      </div>

      {/* Booking Form Modal Overlay */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Book ${chef.name}`}
        subtitle="Customize meal plans, timing, and confirm kitchen visit details."
      >
        {bookingSuccess ? (
          <div className="text-center py-10 space-y-4">
            <div className="h-16 w-16 mx-auto bg-brand-green/10 text-brand-green flex items-center justify-center rounded-full">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-extrabold text-brand-brown">Booking Request Transmitted!</h3>
            <p className="text-sm text-gray-500">Redirecting to your booking dashboards...</p>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Kitchen Visit Start Date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <div className="space-y-1.5 w-full">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Contract Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-beige rounded-xl text-sm text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                >
                  <option value="30-days">30 Days (Standard)</option>
                  <option value="90-days">90 Days (Long-term)</option>
                  <option value="7-days">7 Days (Trial Week)</option>
                  <option value="single-event">Single Event Party</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Meals Covered</label>
              <div className="flex gap-4">
                {Object.keys(meals).map((mealKey) => (
                  <label key={mealKey} className="flex items-center space-x-2 text-sm font-semibold capitalize text-brand-brown cursor-pointer">
                    <input
                      type="checkbox"
                      checked={meals[mealKey]}
                      onChange={(e) => setMeals({ ...meals, [mealKey]: e.target.checked })}
                      className="accent-brand-orange h-4 w-4 rounded border-brand-beige focus:ring-brand-orange"
                    />
                    <span className="capitalize">{mealKey}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Dietary Restrictions</label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-brand-beige rounded-xl text-sm text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              >
                <option value="veg">Pure Vegetarian</option>
                <option value="nonveg">Veg & Non-Veg</option>
                <option value="jain">Jain Rules (No Onion/Garlic)</option>
                <option value="diabetic">Low Carb / Diabetic Friendly</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Kitchen Service Address</label>
              <textarea
                required
                rows={2}
                placeholder="Enter flat number, society name, locality, landmarks..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-brand-beige rounded-xl text-sm text-brand-brown placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
              Confirm Booking Request
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
