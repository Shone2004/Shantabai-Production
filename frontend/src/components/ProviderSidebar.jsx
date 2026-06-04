import React from 'react';
import Card from './Card.jsx';
import Button from './Button.jsx';

export default function ProviderSidebar({ chef, onBookClick }) {
  return (
    <div className="sticky top-24 space-y-6">
      <Card className="p-6 border border-brand-beige shadow-xl rounded-3xl bg-white/95 backdrop-blur-md">
        <div className="space-y-4 text-center">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Starting Rate</p>
          <p className="text-4xl font-extrabold text-brand-orange">
            ₹{chef.rate} <span className="text-sm text-gray-500 font-medium">/ meal</span>
          </p>
          <Button onClick={onBookClick} variant="primary" size="lg" className="w-full">
            Request Booking
          </Button>
        </div>
      </Card>
      
      <Card className="p-6 rounded-3xl border border-brand-beige">
        <h3 className="font-extrabold text-brand-brown mb-3">Why Book Through Us?</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Verified Hygiene Standards
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Customized Spice Levels
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Flexible Subscription Pauses
          </li>
        </ul>
      </Card>
    </div>
  );
}
