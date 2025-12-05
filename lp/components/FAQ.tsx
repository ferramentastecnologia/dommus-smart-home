'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const faqs = [
  {
    id: 1,
    question: 'Quanto custa implementar um sistema de casa inteligente?',
    answer: 'O custo varia bastante dependendo do tamanho da casa, quantidade de cômodos e dispositivos desejados. Oferecemos pacotes desde básicos (R$ 5.000) até completos (R$ 50.000+). Fazemos um orçamento personalizado após análise da sua casa.',
  },
  {
    id: 2,
    question: 'Quanto tempo leva a instalação?',
    answer: 'A maioria das instalações leva entre 4 a 7 semanas, dependendo da complexidade. Casas menores podem levar menos tempo, enquanto mansões com muitos cômodos podem levar mais. O timeline é definido no início do projeto.',
  },
  {
    id: 3,
    question: 'Posso integrar meus dispositivos já existentes?',
    answer: 'Sim! Muitos dos equipamentos e sistemas que você já tem podem ser integrados ao nosso platform. Analisamos o que você tem e adaptamos a solução.',
  },
  {
    id: 4,
    question: 'Qual é a garantia dos trabalhos realizados?',
    answer: 'Oferecemos garantia de 2 anos em todos os trabalhos de instalação e integração. Além disso, mantemos suporte técnico 24/7 para qualquer dúvida ou problema.',
  },
  {
    id: 5,
    question: 'Como funciona a segurança e privacidade dos dados?',
    answer: 'Usamos criptografia de nível enterprise e protocolos de segurança industrial. Seus dados nunca são compartilhados com terceiros. O sistema pode funcionar completamente offline se necessário.',
  },
  {
    id: 6,
    question: 'Preciso conhecer de tecnologia para usar?',
    answer: 'Não! Oferecemos treinamento completo durante a entrega do projeto. A interface é intuitiva e criada para usuários não-técnicos. Disponibilizamos também material de suporte e vídeos tutoriais.',
  },
];

interface FAQItemProps {
  faq: {
    id: number;
    question: string;
    answer: string;
  };
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ faq, isOpen, onToggle }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-xl overflow-hidden hover:border-dommus-primary transition-all duration-300"
    >
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
      >
        <h3 className="text-lg font-bold text-gray-900 text-left">{faq.question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 ml-4"
        >
          <svg
            className="w-6 h-6 text-dommus-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </button>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-200">
          {faq.answer}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <section className="relative py-24 bg-white">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Perguntas <span className="text-dommus-secondary">Frequentes</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Respondemos as dúvidas mais comuns sobre nossas soluções
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-4">Ainda tem dúvidas?</p>
          <motion.a
            href="https://wa.me/5511999999999"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-3 bg-dommus-secondary text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            Conversar com Especialista
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
