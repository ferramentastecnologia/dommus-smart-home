'use client';

import { motion } from 'framer-motion';

const technologies = [
  { name: 'Home Assistant', icon: '🏠', category: 'Automação' },
  { name: 'Zigbee', icon: '📡', category: 'Comunicação' },
  { name: 'Z-Wave', icon: '📶', category: 'Comunicação' },
  { name: 'MQTT', icon: '💬', category: 'Protocolo' },
  { name: 'Node-RED', icon: '🔴', category: 'Lógica' },
  { name: 'N8N', icon: '⚙️', category: 'Automação' },
  { name: 'InfluxDB', icon: '📊', category: 'Dados' },
  { name: 'Grafana', icon: '📈', category: 'Visualização' },
  { name: 'Docker', icon: '🐳', category: 'Infraestrutura' },
  { name: 'PostgreSQL', icon: '🗄️', category: 'Banco de Dados' },
  { name: 'IoT Devices', icon: '🔌', category: 'Hardware' },
  { name: 'API Rest', icon: '🔗', category: 'Integração' },
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
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

export default function TechStack() {
  return (
    <section id="tecnologia" className="relative py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Stack <span className="text-dommus-accent">Tecnológico</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Utilizamos as melhores tecnologias e plataformas open-source para criar automações robustas
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {technologies.map((tech, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.05 }}
              className="p-4 rounded-lg border border-gray-200 bg-white hover:bg-gradient-to-br hover:from-dommus-primary/5 hover:to-dommus-secondary/5 transition-all duration-300 text-center cursor-pointer group"
            >
              <div className="text-4xl mb-2 transform group-hover:scale-125 transition-transform">
                {tech.icon}
              </div>
              <h3 className="font-semibold text-sm text-gray-900">{tech.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{tech.category}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Features highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-6 mt-16 pt-16 border-t border-gray-200"
        >
          {[
            {
              icon: '🔒',
              title: 'Segurança Enterprise',
              description: 'Criptografia de ponta a ponta e protocolos de segurança de nível profissional',
            },
            {
              icon: '⚡',
              title: 'Performance',
              description: 'Sistemas otimizados para resposta em tempo real e máxima eficiência',
            },
            {
              icon: '🔄',
              title: 'Escalável',
              description: 'Arquitetura preparada para crescimento futuro de dispositivos e automações',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
