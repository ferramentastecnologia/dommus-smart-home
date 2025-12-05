'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProcessCards from '@/components/ProcessCards';
import Timeline from '@/components/Timeline';
import TechStack from '@/components/TechStack';
import KPIMetrics from '@/components/KPIMetrics';
import Footer from '@/components/Footer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export default function Home() {
  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full overflow-hidden"
    >
      <Header />
      <HeroSection />
      <ProcessCards />
      <Timeline />
      <TechStack />
      <KPIMetrics />
      <Footer />
    </motion.main>
  );
}
