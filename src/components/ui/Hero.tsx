import React from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import Image from 'next/image';

const Hero = ({hero} : any) => {

  const {title, subTitle, ctaText, backgroundImage} = hero
  return (
    <div className="relative bg-accent overflow-hidden pb-10 px-2">
      <div className="container mx-auto relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 place-items-center md:items-start text-center md:text-left">
          {/* Hero Text */}
          <div className="w-full text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#1A1F2C]">
          {title}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 text-center">
            {subTitle}
            </p>
            
            <div className="flex flex-col justify-center sm:flex-row gap-4">
              <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 bg-[#247a95] text-white font-medium rounded-lg hover:bg-[#247a95]/90 transition-colors shadow-lg shadow-[#247a95]/20">
                {ctaText} <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 bg-accent-foreground/10 text-accent-foreground font-medium rounded-lg hover:bg-accent-foreground/20 transition-colors">
                Explore New Arrivals
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-10">
              <div className="flex flex-col items-center p-3 bg-background/80 backdrop-blur-sm rounded-lg border border-muted">
                <Truck className="w-6 h-6 text-[#247a95] mb-2" />
                <span className="text-xs text-center font-medium">Fast Premium Shipping</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-background/80 backdrop-blur-sm rounded-lg border border-muted">
                <RotateCcw className="w-6 h-6 text-[#247a95] mb-2" />
                <span className="text-xs text-center font-medium">Great Return Policy</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-background/80 backdrop-blur-sm rounded-lg border border-muted">
                <Shield className="w-6 h-6 text-[#247a95] mb-2" />
                <span className="text-xs text-center font-medium">Product Warranty</span>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mt-2">
                Trusted by over <span className="font-medium text-foreground">2,000+</span> satisfied customers nationwide
              </p>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="flex justify-center md:justify-end relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#247a95]/20 rounded-full blur-3xl"></div>
            <div className="relative">
            <Image
              src={`https:${backgroundImage.fields.file.url}`}
              alt={backgroundImage?.fields?.title || 'MuskanOnlineShop Product Image'}
              width={700} // adjust to fit your layout
              height={500}
              className="max-h-[600px] object-cover rounded-2xl shadow-2xl border-muted"
              style={{ width: '100%', height: 'auto' }}
              priority // optional: improves loading speed for important images
            />

              <div className="absolute bottom-0 md:-bottom-10 -left-5 bg-white p-3 rounded-lg shadow-lg border-muted flex items-center space-x-2">
                <div className="bg-[#247a95]/10 p-2 rounded-full">
                  <Star className="w-5 h-5 text-[#247a95]" fill="currentColor" />
                </div>
                <div>
                  <p className="font-medium">4.9/5 Rating</p>
                  <p className="text-xs text-muted-foreground">Based on 500+ reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;