'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Heart, Github } from 'lucide-react';
import BackToTop from '@/components/BackToTop';
import { CONTACT } from '@/lib/constants';

// Custom YouTube Icon Component
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 24 24'
    className={className}
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
  </svg>
);

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 24 24'
    className={className}
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Categories', href: '#categories' },
    { name: 'Timeline', href: '#timeline' },
  ];

  const resourceLinks = [
    { name: 'Round 02 Submission', href: '/round-02-submission' },
    { name: 'Prizes', href: '#prizes' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: CONTACT.social.facebook,
      color: 'hover:text-blue-500',
      borderColor: 'hover:border-blue-500',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: CONTACT.social.instagram,
      color: 'hover:text-pink-500',
      borderColor: 'hover:border-pink-500',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: CONTACT.social.linkedin,
      color: 'hover:text-blue-600',
      borderColor: 'hover:border-blue-600',
    },
    {
      name: 'YouTube',
      icon: YouTubeIcon,
      url: CONTACT.social.youtube,
      color: 'hover:text-red-500',
      borderColor: 'hover:border-red-500',
    },
    {
      name: 'TikTok',
      icon: TikTokIcon,
      url: CONTACT.social.tiktok,
      color: 'hover:text-black dark:hover:text-white',
      borderColor: 'hover:border-black dark:hover:border-white',
    },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('/')) {
      window.location.href = href;
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      const navbarHeight = 64; // h-16 = 64px
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
  };

  return (
    <footer
      id='footer'
      className='relative bg-dhack-base border-t border-dhack-teal/20 overflow-x-hidden'
    >
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-5 pointer-events-none -z-10'>
        <div className='absolute top-10 left-10 w-32 h-32 border border-dhack-teal/30 rounded-full' />
        <div className='absolute top-20 right-20 w-24 h-24 border border-dhack-orange/30 rounded-full' />
        <div className='absolute bottom-10 left-1/3 w-16 h-16 border border-dhack-accent/30 rounded-full' />
      </div>

      <div className='relative z-10 max-w-1200 mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Brand Section */}
          <div className='lg:col-span-2'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className='text-3xl font-bold gradient-text mb-4'>
                DHack&apos;26
              </h3>
              <p className='text-muted-foreground leading-relaxed mb-6 max-w-md'>
                A multi-category AI innovation challenge where school and
                university teams create sustainable, human-centered digital
                solutions.
              </p>

              {/* University Info */}
              <div className='mb-6'>
                <h4 className='text-lg font-semibold text-foreground mb-2'>
                  Organized by
                </h4>
                <p className='text-muted-foreground text-sm leading-relaxed'>
                  Department of Information Technology
                  <br />
                  University of Sri Jayewardenepura
                  <br />
                  Nugegoda, Sri Lanka
                </p>
              </div>

              {/* Social Links */}
              <div className='flex gap-4'>
                {socialLinks.map(social => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 bg-background border border-dhack-teal/30 rounded-lg text-muted-foreground ${social.color} ${social.borderColor} transition-all duration-300 hover:shadow-lg`}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <Icon className='w-5 h-5' />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div className='hidden md:block'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h4 className='text-lg font-semibold text-foreground mb-6'>
                Quick Links
              </h4>
              <ul className='space-y-3'>
                {quickLinks.map(link => (
                  <li key={link.name}>
                    <motion.button
                      whileHover={{ x: 5 }}
                      onClick={() => scrollToSection(link.href)}
                      className='text-muted-foreground hover:text-dhack-teal transition-colors duration-200 text-left'
                    >
                      {link.name}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Resources */}
          <div className='hidden md:block'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4 className='text-lg font-semibold text-foreground mb-6'>
                Resources
              </h4>
              <ul className='space-y-3'>
                {resourceLinks.map(link => (
                  <li key={link.name}>
                    <motion.button
                      whileHover={{ x: 5 }}
                      onClick={() => scrollToSection(link.href)}
                      className='text-muted-foreground hover:text-dhack-teal transition-colors duration-200 text-left'
                    >
                      {link.name}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className='mt-12 pt-8 border-t border-dhack-teal/20'
        >
          {/* Desktop Bottom Section */}
          <div className='hidden md:flex flex-row justify-between items-center gap-4'>
            <div className='flex items-center gap-2 text-muted-foreground text-sm'>
              <span>© {currentYear} DHACK&apos;26.</span>
            </div>

            <div className='flex items-center gap-4 text-muted-foreground text-sm'>
              <span>University of Sri Jayewardenepura</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>

          {/* Mobile Bottom Section */}
          <div className='md:hidden flex flex-col items-center gap-3 text-center'>
            <div className='text-muted-foreground text-sm'>
              © {currentYear} DHACK&apos;26. All rights reserved
            </div>
            <div className='text-muted-foreground text-sm'>
              Department of Information Technology
            </div>
            <div className='text-muted-foreground text-sm'>
              University of Sri Jayewardenepura
            </div>
          </div>

          {/* Design and Developed by - Smaller on Mobile */}
          <div className='mt-4 md:mt-6 text-center'>
            <div className='inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-dhack-orange/10 to-dhack-teal/10 rounded-full px-3 md:px-4 py-1.5 md:py-2 border border-dhack-teal/20'>
              <span className='text-xs md:text-sm text-muted-foreground'>
                Designed by
              </span>
              <motion.a
                href='https://github.com/Harsha-Fernando'
                target='_blank'
                rel='noopener noreferrer'
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-1.5 md:gap-2 text-muted-foreground hover:text-dhack-teal transition-colors duration-300'
                aria-label="Visit Harsha Fernando's GitHub"
              >
                <Github className='w-3.5 h-3.5 md:w-4 md:h-4' />
                <span className='text-xs md:text-sm font-medium'>
                  Harsha Fernando
                </span>
              </motion.a>
              <span className='text-xs md:text-sm text-muted-foreground'>
                &
              </span>
              <motion.a
                href='https://github.com/dilutha'
                target='_blank'
                rel='noopener noreferrer'
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-1.5 md:gap-2 text-muted-foreground hover:text-dhack-teal transition-colors duration-300'
                aria-label="Visit Dilutha Weerasinghe's GitHub"
              >
                <Github className='w-3.5 h-3.5 md:w-4 md:h-4' />
                <span className='text-xs md:text-sm font-medium'>
                  Dilutha Weerasinghe
                </span>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Back to Top Button */}
      <BackToTop />

      {/* Background Effects */}
      <div className='absolute bottom-0 left-0 w-64 h-64 bg-dhack-orange/5 rounded-full blur-3xl pointer-events-none -z-10' />
      <div className='absolute top-0 right-0 w-64 h-64 bg-dhack-teal/5 rounded-full blur-3xl pointer-events-none -z-10' />
    </footer>
  );
};

export default Footer;
