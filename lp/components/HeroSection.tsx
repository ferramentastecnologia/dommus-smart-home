'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
      },
    }),
  };

  return (
    <section className="relative w-full pt-20 pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-dommus-primary/10 via-dommus-secondary/5 to-dommus-accent/10" />

      {/* Animated background elements */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-10 right-20 w-72 h-72 bg-dommus-primary/10 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, -15, 0],
        }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-20 left-10 w-96 h-96 bg-dommus-secondary/10 rounded-full blur-3xl"
      />

      <div className="relative section-container z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <motion.div className="space-y-6">
            <motion.h1
              variants={textVariants}
              custom={0}
              initial="hidden"
              whileInView="visible"
              className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
            >
              Transforme sua{' '}
              <motion.span className="bg-gradient-to-r from-dommus-primary to-dommus-secondary bg-clip-text text-transparent">
                Casa em Casa Inteligente
              </motion.span>
            </motion.h1>

            <motion.p
              variants={textVariants}
              custom={1}
              initial="hidden"
              whileInView="visible"
              className="text-xl text-gray-600 leading-relaxed"
            >
              Automações inteligentes, controle total e integração perfeita com todos seus dispositivos. Crie um lar conectado, eficiente e adaptado ao seu estilo de vida.
            </motion.p>

            <motion.div
              variants={textVariants}
              custom={2}
              initial="hidden"
              whileInView="visible"
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 25px rgba(107, 70, 193, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Começar Implementação
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary"
              >
                Ver Demonstração
              </motion.button>
            </motion.div>

            <motion.div
              variants={textVariants}
              custom={3}
              initial="hidden"
              whileInView="visible"
              className="flex gap-6 pt-8 border-t border-gray-200"
            >
              {[
                { number: '500+', label: 'Casas Transformadas' },
                { number: '98%', label: 'Satisfação' },
                { number: '24/7', label: 'Suporte' },
              ].map((stat, idx) => (
                <div key={idx} className="flex-1">
                  <div className="text-2xl font-bold text-dommus-primary">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-96 md:h-full"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              {/* Gradient card */}
              <div className="absolute inset-0 bg-gradient-to-br from-dommus-primary via-dommus-secondary to-dommus-accent opacity-10" />

              {/* Animated grid */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-64 h-64 bg-gradient-to-br from-dommus-primary/20 to-dommus-secondary/20 rounded-full blur-3xl animate-pulse" />
              </motion.div>

              {/* Icons/Elements showcase */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="grid grid-cols-2 gap-4">
                  {['🏠', '💡', '🔒', '📱'].map((icon, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ delay: idx * 0.2, duration: 3, repeat: Infinity }}
                      className="w-20 h-20 bg-white/80 backdrop-blur rounded-xl flex items-center justify-center text-4xl shadow-lg"
                    >
                      {icon}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
