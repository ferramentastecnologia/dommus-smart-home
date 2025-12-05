'use client';

import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-200/50 shadow-sm"
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300"
          >
            <span className="text-white font-bold text-lg">D</span>
          </motion.div>
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
              whileHover={{ color: '#6B46C1' }}
              className="text-gray-700 hover:text-dommus-primary transition-colors font-medium relative group"
            >
              {item}
              <motion.div
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-dommus-primary to-dommus-secondary origin-left"
              />
            </motion.a>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(107, 70, 193, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2.5 bg-gradient-to-r from-dommus-primary to-dommus-secondary text-white rounded-lg font-bold transition-all duration-300 hidden md:block hover:shadow-xl"
        >
          Começar Agora
        </motion.button>
      </nav>
    </motion.header>
  );
}
