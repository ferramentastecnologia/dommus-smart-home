'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: 'Carlos Silva',
    role: 'Empresário',
    content: 'A equipe Dommus transformou completamente minha casa. A qualidade da instalação e o suporte pós-venda foram impecáveis!',
    rating: 5,
    avatar: '👨‍💼',
  },
  {
    id: 2,
    name: 'Marina Costa',
    role: 'Arquiteta',
    content: 'Como profissional, fico impressionada com a integração perfeita dos sistemas e a atenção aos detalhes no projeto.',
    rating: 5,
    avatar: '👩‍🏫',
  },
  {
    id: 3,
    name: 'Roberto Santos',
    role: 'Aposentado',
    content: 'Mesmo sem experiência com tecnologia, consegui aprender facilmente. O treinamento foi excelente!',
    rating: 5,
    avatar: '👴',
  },
  {
    id: 4,
    name: 'Juliana Oliveira',
    role: 'Mãe de Família',
    content: 'A segurança que tenho agora é incomparável. Posso monitorar tudo pelo celular, dá uma paz de espírito!',
    rating: 5,
    avatar: '👩‍👧‍👦',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

export default function Testimonials() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            O que nossos <span className="text-dommus-primary">clientes dizem</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Depoimentos reais de pessoas que transformaram suas casas
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-dommus-primary hover:shadow-xl transition-all duration-300"
            >
              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-xl">⭐</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dommus-primary to-dommus-secondary flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
