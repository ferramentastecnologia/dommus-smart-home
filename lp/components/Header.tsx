'use client';

import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200"
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Dommus</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-8">
          {['Recursos', 'Processo', 'Tecnologia', 'Contato'].map((item, idx) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-gray-700 hover:text-dommus-primary transition-colors font-medium"
            >
              {item}
            </motion.a>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary hidden md:block"
        >
          Começar Agora
        </motion.button>
      </nav>
    </motion.header>
  );
}
