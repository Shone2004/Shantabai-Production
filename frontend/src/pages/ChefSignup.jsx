import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTED_CUISINES = [
  'North Indian', 'South Indian', 'Maharashtrian', 'Gujarati', 
  'Bengali', 'Chinese', 'Italian', 'Healthy/Diet', 'Baking', 
  'Street Food', 'Vegan', 'Keto', 'Desserts', 'Mughlai', 'Continental',
  'Punjabi', 'Rajasthani', 'Biryani Special', 'Seafood'
];

export default function ChefSignup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    area: '',
    pincode: '',
    fullAddress: '',
    cuisines: [],
    experience: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });

  const [cuisineInput, setCuisineInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Aadhar specific states
  const [aadharFile, setAadharFile] = useState(null);
  const [aadharFileName, setAadharFileName] = useState('');

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  const filteredCuisines = SUGGESTED_CUISINES.filter(c => 
    c.toLowerCase().includes(cuisineInput.toLowerCase()) && 
    !formData.cuisines.includes(c)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddCuisine = (e, customCuisine = null) => {
    if (e) e.preventDefault();
    const cuisineToAdd = customCuisine || cuisineInput;
    if (cuisineToAdd.trim() && !formData.cuisines.includes(cuisineToAdd.trim())) {
      setFormData(prev => ({
        ...prev,
        cuisines: [...prev.cuisines, cuisineToAdd.trim()]
      }));
      setCuisineInput('');
      setShowSuggestions(false);
      if (errors.cuisines) {
        setErrors(prev => ({ ...prev, cuisines: null }));
      }
    }
  };

  const handleRemoveCuisine = (cuisineToRemove) => {
    setFormData(prev => ({
      ...prev,
      cuisines: prev.cuisines.filter(c => c !== cuisineToRemove)
    }));
  };

  const handleCuisineKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCuisine(e);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'Image must be less than 5MB' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setErrors(prev => ({ ...prev, photo: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAadharUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, aadhar: 'File must be less than 5MB' }));
        return;
      }
      setAadharFile(file);
      setAadharFileName(file.name);
      setErrors(prev => ({ ...prev, aadhar: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Valid 10-digit phone number required';
    if (!photoPreview) newErrors.photo = 'Profile photo is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.area.trim()) newErrors.area = 'Area/Locality is required';
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Valid 6-digit pincode required';
    if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Full address is required';
    if (formData.cuisines.length === 0) newErrors.cuisines = 'Add at least one cuisine specialization';
    if (!formData.experience || isNaN(formData.experience) || Number(formData.experience) < 0) newErrors.experience = 'Valid years of experience required';
    if (!formData.bio.trim() || formData.bio.length < 20) newErrors.bio = 'Bio must be at least 20 characters';
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);
    
    if (!validateForm()) {
      // Scroll to top to show errors if needed
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header section */}
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-gray-900 tracking-tight mb-3"
          >
            Join as a <span className="text-brand-green">Home Chef</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Turn your passion for cooking into a thriving business. Reach hundreds of hungry customers in your neighborhood.
          </motion.p>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎉</span>
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-1">Registration Successful!</h3>
              <p className="text-green-700">Welcome to the Shantabai family. Our team will review your application and contact you shortly.</p>
            </motion.div>
          )}
          
          {submitStatus === 'error' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-red-700 shadow-sm"
            >
              Something went wrong. Please try submitting again.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
        >
          <div className="p-8 sm:p-10 space-y-12">
            
            {/* --- SECTION 1: Personal Details --- */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profile Photo Upload */}
                <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-6 mb-2">
                  <div className="relative w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 group">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-gray-400 group-hover:scale-110 transition-transform">📸</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs font-bold">Change</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Profile Photo <span className="text-red-500">*</span></h3>
                    <p className="text-xs text-gray-500 mb-2">A clear, friendly photo of yourself in the kitchen works best. Max size: 5MB.</p>
                    {errors.photo && <p className="text-xs font-bold text-red-500">{errors.photo}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                    placeholder="e.g. Savitri Devi"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none ${errors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 focus:border-brand-green focus:ring-4 focus:ring-brand-green/10'}`}
                  />
                  {errors.fullName && <p className="text-xs font-bold text-red-500">{errors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleInputChange}
                    placeholder="savitri@example.com"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-green'}`}
                  />
                  {errors.email && <p className="text-xs font-bold text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-500 font-bold text-sm">
                      +91
                    </span>
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full px-4 py-3 rounded-r-xl border bg-gray-50 focus:bg-white transition-all outline-none ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-green'}`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs font-bold text-red-500">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* --- SECTION 2: Location Details --- */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">Location & Kitchen</h2>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">City <span className="text-red-500">*</span></label>
                  <input 
                    type="text" name="city" value={formData.city} onChange={handleInputChange}
                    placeholder="e.g. Pune"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none ${errors.city ? 'border-red-300' : 'border-gray-200 focus:border-brand-green'}`}
                  />
                  {errors.city && <p className="text-xs font-bold text-red-500">{errors.city}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Area / Locality <span className="text-red-500">*</span></label>
                  <input 
                    type="text" name="area" value={formData.area} onChange={handleInputChange}
                    placeholder="e.g. Baner"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none ${errors.area ? 'border-red-300' : 'border-gray-200 focus:border-brand-green'}`}
                  />
                  {errors.area && <p className="text-xs font-bold text-red-500">{errors.area}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Pincode <span className="text-red-500">*</span></label>
                  <input 
                    type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                    placeholder="411045"
                    maxLength={6}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none ${errors.pincode ? 'border-red-300' : 'border-gray-200 focus:border-brand-green'}`}
                  />
                  {errors.pincode && <p className="text-xs font-bold text-red-500">{errors.pincode}</p>}
                </div>

                <div className="space-y-1.5 md:col-span-6">
                  <label className="text-sm font-bold text-gray-700">Full Kitchen Address <span className="text-red-500">*</span></label>
                  <textarea 
                    name="fullAddress" value={formData.fullAddress} onChange={handleInputChange}
                    placeholder="Flat/House No, Building, Street..."
                    rows={2}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none resize-none ${errors.fullAddress ? 'border-red-300' : 'border-gray-200 focus:border-brand-green'}`}
                  />
                  {errors.fullAddress && <p className="text-xs font-bold text-red-500">{errors.fullAddress}</p>}
                </div>

              </div>
            </div>

            {/* --- SECTION 3: Culinary Profile --- */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">Culinary Profile</h2>
              
              <div className="space-y-6">
                
                {/* Dynamic Tag Input with Autocomplete for Cuisines */}
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-gray-700">Cuisine Specialization <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-500 mb-2">Type a cuisine and click Add or press Enter (e.g. "Maharashtrian", "Baking")</p>
                  
                  <div className="flex gap-2 relative">
                    <input 
                      type="text" 
                      value={cuisineInput}
                      onChange={(e) => {
                        setCuisineInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onKeyDown={handleCuisineKeyDown}
                      placeholder="Add a cuisine..."
                      className={`flex-1 px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none ${errors.cuisines && formData.cuisines.length === 0 ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-green'}`}
                    />
                    <button 
                      type="button"
                      onClick={(e) => handleAddCuisine(e)}
                      className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                      Add
                    </button>

                    {/* Autocomplete Dropdown */}
                    <AnimatePresence>
                      {showSuggestions && cuisineInput.trim() && filteredCuisines.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full left-0 right-[90px] mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto"
                        >
                          {filteredCuisines.map(cuisine => (
                            <div 
                              key={cuisine}
                              onClick={() => handleAddCuisine(null, cuisine)}
                              className="px-4 py-2.5 hover:bg-brand-green/10 cursor-pointer text-sm font-medium text-gray-700 transition-colors border-b border-gray-50 last:border-0"
                            >
                              {cuisine}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Selected Tags Display */}
                  {formData.cuisines.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <AnimatePresence>
                        {formData.cuisines.map(cuisine => (
                          <motion.div
                            key={cuisine}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 shadow-sm"
                          >
                            {cuisine}
                            <button
                              type="button"
                              onClick={() => handleRemoveCuisine(cuisine)}
                              className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                            >
                              <span className="text-[10px] leading-none">✕</span>
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                  {errors.cuisines && formData.cuisines.length === 0 && <p className="text-xs font-bold text-red-500 mt-1">{errors.cuisines}</p>}
                </div>

                <div className="space-y-1.5 w-full md:w-1/2">
                  <label className="text-sm font-bold text-gray-700">Years of Experience <span className="text-red-500">*</span></label>
                  <input 
                    type="number" name="experience" value={formData.experience} onChange={handleInputChange}
                    placeholder="e.g. 5"
                    min="0"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none ${errors.experience ? 'border-red-300' : 'border-gray-200 focus:border-brand-green'}`}
                  />
                  {errors.experience && <p className="text-xs font-bold text-red-500">{errors.experience}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Short Bio / About Me <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-500">Tell customers a bit about your cooking journey, secret recipes, or hygiene practices.</p>
                  <textarea 
                    name="bio" value={formData.bio} onChange={handleInputChange}
                    placeholder="I started cooking traditional Maharashtrian food 10 years ago..."
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none resize-none ${errors.bio ? 'border-red-300' : 'border-gray-200 focus:border-brand-green'}`}
                  />
                  {errors.bio && <p className="text-xs font-bold text-red-500">{errors.bio}</p>}
                </div>
              </div>
            </div>

            {/* --- SECTION 4: Identity Verification --- */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Identity Verification</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative group overflow-hidden transition-all hover:bg-brand-green/5 hover:border-brand-green/30">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    
                    <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                      <span className="text-xl">📄</span>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-sm font-bold text-gray-900 mb-1">Aadhar Card Verification</h3>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto sm:mx-0">
                        Upload a scanned copy or clear photo of your Aadhar Card to get a "Verified Chef" badge faster. (PDF, JPG, PNG)
                      </p>
                      {aadharFileName && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-green-200 text-xs font-bold text-green-700 shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {aadharFileName}
                        </div>
                      )}
                      {errors.aadhar && <p className="text-xs font-bold text-red-500 mt-2">{errors.aadhar}</p>}
                    </div>

                    <div className="shrink-0 mt-4 sm:mt-0 relative">
                      <button type="button" className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:border-gray-300 transition-all cursor-pointer">
                        {aadharFileName ? 'Change File' : 'Upload File'}
                      </button>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleAadharUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION 5: Account Security --- */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">Account Security</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Password <span className="text-red-500">*</span></label>
                  <input 
                    type="password" name="password" value={formData.password} onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none ${errors.password ? 'border-red-300' : 'border-gray-200 focus:border-brand-green'}`}
                  />
                  {errors.password && <p className="text-xs font-bold text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
                  <input 
                    type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200 focus:border-brand-green'}`}
                  />
                  {errors.confirmPassword && <p className="text-xs font-bold text-red-500">{errors.confirmPassword}</p>}
                </div>

              </div>
            </div>

          </div>
          
          {/* Form Footer / Submit */}
          <div className="bg-gray-50 px-8 py-6 sm:px-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 text-center sm:text-left max-w-sm">
              By registering, you agree to Shantabai's <a href="#" className="text-brand-orange hover:underline">Terms of Service</a> and <a href="#" className="text-brand-orange hover:underline">Privacy Policy</a>.
            </p>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green/90 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Complete Registration'}
            </button>
          </div>
        </motion.form>

      </div>
    </div>
  );
}
