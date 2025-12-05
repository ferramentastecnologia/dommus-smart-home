'use client';

import { motion } from 'framer-motion';

const processes = [
  {
    step: 1,
    icon: '📋',
    title: 'Consulta & Planejamento',
    description: 'Conhecemos sua casa e necessidades para criar o melhor projeto de automação.',
  },
  {
    step: 2,
    icon: '⚙️',
    title: 'Design & Configuração',
    description: 'Planejamos a arquitetura dos sistemas e selecionamos dispositivos ideais.',
  },
  {
    step: 3,
    icon: '🔧',
    title: 'Instalação & Setup',
    description: 'Instalamos todos os equipamentos e configuramos as integrações inteligentes.',
  },
  {
    step: 4,
    icon: '🧪',
    title: 'Testes & Otimização',
    description: 'Testamos cada sistema para garantir perfeito funcionamento e performance.',
  },
  {
    step: 5,
    icon: '🚀',
    title: 'Suporte & Manutenção',
    description: 'Oferecemos suporte 24/7 e atualizações contínuas para seu lar inteligente.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function ProcessCards() {
  return (
    <section id="processo" className="relative py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nosso <span className="text-dommus-primary">Processo</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            5 etapas cuidadosamente planejadas para transformar sua casa em um lar inteligente
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {processes.map((process, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -12, boxShadow: '0 30px 60px rgba(107, 70, 193, 0.25)' }}
              className="relative group"
            >
              {/* Connection line */}
              {idx < processes.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: idx * 0.2, duration: 0.8 }}
                  className="hidden lg:block absolute top-16 -right-3 w-6 h-1 bg-gradient-to-r from-dommus-primary via-dommus-secondary to-transparent origin-left"
                />
              )}

              <div className="h-full p-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:bg-gradient-to-br hover:from-dommus-primary/8 hover:to-dommus-secondary/8 transition-all duration-300 hover:border-dommus-primary">
                {/* Step number */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ delay: idx * 0.2, duration: 2, repeat: Infinity }}
                  className="absolute -top-5 -left-4 w-10 h-10 bg-gradient-to-br from-dommus-primary to-dommus-secondary text-white rounded-full flex items-center justify-center font-bold shadow-xl"
                >
                  {process.step}
                </motion.div>

                {/* Icon */}
                <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform duration-300 origin-center">
                  {process.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{process.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{process.description}</p>

                {/* Bottom accent */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: idx * 0.2 + 0.3, duration: 0.8 }}
                  className="h-1 bg-gradient-to-r from-dommus-primary to-dommus-secondary rounded-full mt-4 origin-left"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
