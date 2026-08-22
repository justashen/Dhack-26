'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      ticking.current = false;
      const next = window.scrollY > 50;
      // Avoid unnecessary re-renders
      setScrolled(prev => (prev !== next ? next : prev));
    };

    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll as any);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Categories', href: '#categories' },
    { name: 'Timeline', href: '#timeline' },
    { name: 'Round 02', href: '/round-02-submission' },
    { name: 'Prizes', href: '#prizes' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    // Close mobile menu first
    setIsOpen(false);

    // Check if it's a navigation link (starts with /)
    if (href.startsWith('/')) {
      window.location.href = href;
      return;
    }

    // Small delay to allow menu to close before scrolling
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        const navbarHeight = window.innerWidth >= 768 ? 80 : 64; // md:h-20 = 80px, h-16 = 64px
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      } else {
        window.location.href = `/${href}`;
      }
    }, 100);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className='max-w-1200 mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className='flex-shrink-0'>
            <div className='flex items-center'>
              <a href='/' aria-label='Go to home'>
                <Image
                  src='/assests/dhack logo.png'
                  alt="DHack'26 Logo"
                  width={400}
                  height={100}
                  className='h-20 w-auto sm:h-28 md:h-32 lg:h-36 xl:h-40 2xl:h-44'
                  priority
                />
              </a>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex flex-1 justify-center'>
            <div className='flex items-center gap-3 lg:gap-5'>
              {navItems.map(item => (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection(item.href)}
                  className='text-foreground hover:text-dhack-teal px-2 py-2 rounded-md text-sm lg:text-base font-medium nav-link transition-colors duration-200'
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right section: Theme toggle */}
          <div className='hidden md:flex items-center gap-2'>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden flex items-center gap-1'>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='text-foreground'
              aria-expanded={isOpen}
              aria-controls='mobile-menu'
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id='mobile-menu'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden bg-dhack-base/95 backdrop-blur-lg'
            role='menu'
            aria-label='Mobile navigation menu'
          >
            <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
              {navItems.map(item => (
                <motion.button
                  key={item.name}
                  whileHover={{ x: 10 }}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    scrollToSection(item.href);
                  }}
                  className='text-foreground hover:text-dhack-teal block px-3 py-2 rounded-md text-base font-medium nav-link w-full text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dhack-teal'
                  role='menuitem'
                  tabIndex={0}
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
