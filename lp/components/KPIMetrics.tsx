'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const metrics = [
  { label: 'Casas Transformadas', value: 500, suffix: '+', icon: '🏠' },
  { label: 'Clientes Satisfeitos', value: 98, suffix: '%', icon: '😊' },
  { label: 'Anos de Experiência', value: 8, suffix: '+', icon: '📅' },
  { label: 'Dispositivos Integrados', value: 50, suffix: '+', icon: '🔌' },
];

const Counter = ({ target, duration = 2 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(target * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return <>{count}</>;
};

export default function KPIMetrics() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-dommus-primary via-dommus-secondary to-dommus-accent overflow-hidden">
      {/* Background decorations */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 0.5 }}
        className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Números que Falam
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Resultados comprovados de transformações bem-sucedidas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-5xl mb-4">{metric.icon}</div>

              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                <Counter target={metric.value} />
                <span className="text-4xl">{metric.suffix}</span>
              </div>

              <p className="text-white/80 font-medium">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-16 p-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para transformar sua casa?
          </h3>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco hoje e comece seu projeto de automação residencial
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-dommus-primary font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Solicitar Consulta
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all"
            >
              Ver Portfolio
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
