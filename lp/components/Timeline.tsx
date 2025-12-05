'use client';

import { motion } from 'framer-motion';

const timelineEvents = [
  {
    phase: 'Semana 1',
    title: 'Análise e Planejamento',
    description: 'Visitamos sua casa, entendemos necessidades e criamos projeto inicial.',
    icon: '📍',
  },
  {
    phase: 'Semana 2-3',
    title: 'Aquisição de Equipamentos',
    description: 'Selecionamos e adquirimos todos os dispositivos e componentes necessários.',
    icon: '📦',
  },
  {
    phase: 'Semana 4-5',
    title: 'Instalação Física',
    description: 'Instalamos fiação, dispositivos e infraestrutura de comunicação.',
    icon: '🔧',
  },
  {
    phase: 'Semana 6',
    title: 'Configuração e Testes',
    description: 'Integramos tudo, testamos sistemas e otimizamos automatizações.',
    icon: '⚙️',
  },
  {
    phase: 'Semana 7',
    title: 'Treinamento',
    description: 'Ensinamos a usar todos os sistemas e recursos da sua casa inteligente.',
    icon: '🎓',
  },
  {
    phase: 'Contínuo',
    title: 'Suporte & Manutenção',
    description: 'Suporte 24/7, atualizações de segurança e novos recursos.',
    icon: '🛡️',
  },
];

export default function Timeline() {
  return (
    <section className="relative py-24 bg-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cronograma de <span className="text-dommus-secondary">Implementação</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Timeline típico para uma implementação completa
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-dommus-primary via-dommus-secondary to-dommus-accent transform -translate-x-1/2" />

          <div className="space-y-12">
            {timelineEvents.map((event, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`grid md:grid-cols-2 gap-8 items-center ${
                  idx % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                {/* Left/Right content */}
                <motion.div
                  whileHover={{ x: idx % 2 === 0 ? 10 : -10 }}
                  className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all"
                >
                  <div className="text-sm font-semibold text-dommus-primary uppercase tracking-wide mb-2">
                    {event.phase}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600">{event.description}</p>
                </motion.div>

                {/* Center dot */}
                <div className="hidden md:flex justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                    className="w-12 h-12 rounded-full bg-white border-4 border-dommus-primary flex items-center justify-center text-2xl shadow-lg relative z-10"
                  >
                    {event.icon}
                  </motion.div>
                </div>

                {/* Empty space for layout */}
                <div />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
