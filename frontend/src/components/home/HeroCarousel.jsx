import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const banners = [
  {
    id: 'banner-1',
    image: "/banners/banner1.jpg",
    alt: "Fresh home-cooked Indian thali meals prepared by local cooks",
    title: "Taste of Tradition",
    subtitle: "Authentic, freshly prepared thalis from trusted neighbourhood home cooks.",
    ctaText: "Browse Today's Menu",
    ctaLink: "/food"
  },
  {
    id: 'banner-2',
    image: "/banners/banner2.jpg",
    alt: "Pure home kitchens with verified hygiene audits",
    title: "Hygienic Home Kitchens",
    subtitle: "Zero additives, oil-controlled, and cooked in pure domestic kitchens.",
    ctaText: "Meet the Cooks",
    ctaLink: "/search"
  },
  {
    id: 'banner-3',
    image: "/banners/banner3.jpg",
    alt: "Traditional home-style meals with doorstep pickup options",
    title: "Ghar ka Khana, Direct from Source",
    subtitle: "Support local women chefs and savour the warmth of motherly recipes.",
    ctaText: "Join as a Partner",
    ctaLink: "/chef-signup"
  }
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 }
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 }
    }
  })
};

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Autoplay Logic
  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (!isHovered) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isHovered, currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  const handleDotClick = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    }
  };

  // Drag handlers for mobile swipe
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden select-none outline-none group rounded-2xl md:rounded-3xl border border-slate-100 bg-slate-50 shadow-sm"
      style={{ contentVisibility: 'auto' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional food and kitchen banners"
    >
      {/* Aspect ratio bounding box (prevents CLS) */}
      <div className="relative w-full h-[180px] sm:h-[220px] md:h-[350px] lg:h-[400px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${currentIndex + 1} of ${banners.length}`}
          >
            {/* Shimmer Skeleton Placeholder */}
            {!loadedImages[banners[currentIndex].id] && (
              <div className="absolute inset-0 w-full h-full bg-slate-200 animate-pulse flex items-center justify-center z-10">
                <div className="w-12 h-12 rounded-full border-4 border-brand-green/20 border-t-brand-green animate-spin" />
              </div>
            )}

            {/* Banner Image */}
            <img
              src={banners[currentIndex].image}
              alt={banners[currentIndex].alt}
              className={`w-full h-full object-cover transition-opacity duration-500 select-none ${
                loadedImages[banners[currentIndex].id] ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => handleImageLoad(banners[currentIndex].id)}
              loading="lazy"
              draggable="false"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent pointer-events-none" />

            {/* Banner Content Panel */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 text-white text-left pointer-events-none select-none max-w-xl md:max-w-2xl">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit mb-2 sm:mb-3">
                Featured
              </span>
              <h3 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tight leading-tight drop-shadow-sm select-text">
                {banners[currentIndex].title}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-200 font-medium leading-relaxed mt-1 sm:mt-2 drop-shadow-sm line-clamp-2 md:line-clamp-none select-text">
                {banners[currentIndex].subtitle}
              </p>
              <div className="mt-4 sm:mt-6 pointer-events-auto">
                <Link
                  to={banners[currentIndex].ctaLink}
                  className="inline-flex items-center gap-1 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[#0A4D2B] hover:bg-[#083a20] active:scale-95 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md"
                >
                  {banners[currentIndex].ctaText}
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrow Controls - Desktop Only */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 cursor-pointer shadow border border-white/5 active:scale-90 z-20 focus:outline-none focus:ring-2 focus:ring-[#0A4D2B]"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 cursor-pointer shadow border border-white/5 active:scale-90 z-20 focus:outline-none focus:ring-2 focus:ring-[#0A4D2B]"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0A4D2B] cursor-pointer ${
                index === currentIndex 
                  ? 'w-6 bg-[#0A4D2B]' 
                  : 'w-2 bg-white/55 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
