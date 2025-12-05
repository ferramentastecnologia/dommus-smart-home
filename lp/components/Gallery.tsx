'use client';

import { motion } from 'framer-motion';

const projects = [
  {
    id: 1,
    name: 'Residência Moderna',
    category: 'Casa Inteligente',
    devices: '25+ dispositivos',
    image: '🏡',
  },
  {
    id: 2,
    name: 'Apartamento Executivo',
    category: 'Home Cinema',
    devices: '18+ dispositivos',
    image: '🎬',
  },
  {
    id: 3,
    name: 'Cobertura Luxo',
    category: 'Segurança Avançada',
    devices: '35+ dispositivos',
    image: '🔐',
  },
  {
    id: 4,
    name: 'Casa Sustentável',
    category: 'Eficiência Energética',
    devices: '22+ dispositivos',
    image: '♻️',
  },
  {
    id: 5,
    name: 'Mansão Inteligente',
    category: 'Automação Completa',
    devices: '50+ dispositivos',
    image: '👑',
  },
  {
    id: 6,
    name: 'Escritório Inteligente',
    category: 'Produtividade',
    devices: '20+ dispositivos',
    image: '💼',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Gallery() {
  return (
    <section className="relative py-24 bg-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Portfólio de <span className="text-dommus-secondary">Projetos</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conheça alguns dos projetos que já transformamos em casas inteligentes
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(107, 70, 193, 0.2)' }}
              className="group rounded-2xl border border-gray-200 overflow-hidden hover:border-dommus-primary transition-all duration-300 bg-white"
            >
              {/* Image area */}
              <div className="relative h-48 bg-gradient-to-br from-dommus-primary/10 via-dommus-secondary/10 to-dommus-accent/10 flex items-center justify-center overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-7xl"
                >
                  {project.image}
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm font-semibold text-dommus-primary uppercase tracking-wide mb-2">
                  {project.category}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{project.name}</h3>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <span className="text-lg">🔌</span>
                  <span className="text-sm font-medium">{project.devices}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-2 px-4 rounded-lg border border-dommus-primary text-dommus-primary font-medium text-sm hover:bg-dommus-primary hover:text-white transition-all duration-300"
                >
                  Ver Detalhes
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
