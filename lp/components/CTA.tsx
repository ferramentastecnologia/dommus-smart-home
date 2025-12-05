'use client';

import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-0 right-0 w-96 h-96 bg-dommus-primary/10 rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [360, 0],
        }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-dommus-secondary/10 rounded-full blur-3xl"
      />

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="p-12 rounded-3xl bg-gradient-to-br from-dommus-primary via-dommus-secondary to-dommus-accent shadow-2xl"
          >
            {/* Content */}
            <div className="text-center text-white">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Pronto para transformar sua casa?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
              >
                Agende uma consulta gratuita com nossos especialistas e descubra como a automação inteligente pode melhorar sua qualidade de vida.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-3 gap-6 mb-10 py-8 border-t border-b border-white/20"
              >
                <div>
                  <div className="text-3xl font-bold">1º</div>
                  <div className="text-white/80 text-sm">Em Qualidade</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-white/80 text-sm">Clientes Felizes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">8+</div>
                  <div className="text-white/80 text-sm">Anos de Experiência</div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-dommus-primary font-bold rounded-lg hover:shadow-xl transition-all"
                >
                  Agendar Consulta
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all"
                >
                  Mais Informações
                </motion.button>
              </motion.div>

              {/* Support info */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-white/80 text-sm"
              >
                📞 Suporte 24/7 | 📧 contato@dommus.com.br | 💬 WhatsApp
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
