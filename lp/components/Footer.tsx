'use client';

import { motion } from 'framer-motion';

const footerLinks = {
  'Sobre': ['Empresa', 'Missão', 'Contato', 'Blog'],
  'Serviços': ['Instalação', 'Consultoria', 'Suporte', 'Treinamento'],
  'Recursos': ['Documentação', 'FAQs', 'Guias', 'Comunidade'],
  'Legal': ['Privacidade', 'Termos', 'Cookies', 'Segurança'],
};

const socialLinks = [
  { icon: '📘', label: 'Facebook', url: '#' },
  { icon: '🐦', label: 'Twitter', url: '#' },
  { icon: '📸', label: 'Instagram', url: '#' },
  { icon: '🔗', label: 'LinkedIn', url: '#' },
];

export default function Footer() {
  return (
    <footer id="contato" className="bg-gradient-to-b from-gray-50 via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-0 right-0 w-96 h-96 bg-dommus-primary/10 rounded-full blur-3xl opacity-30"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-dommus-secondary/10 rounded-full blur-3xl opacity-30"
      />

      {/* Main Footer */}
      <div className="section-container text-white relative z-10">
        <div className="grid md:grid-cols-5 gap-8 pb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="md:col-span-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="font-bold text-xl">Dommus</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Transformando casas em lares inteligentes desde 2017
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-dommus-primary hover:to-dommus-secondary hover:text-white flex items-center justify-center text-lg transition-all border border-white/20"
                  title={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx + 1) * 0.1 }}
            >
              <h4 className="font-bold text-sm uppercase tracking-wider text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-dommus-secondary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"
        />

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {[
            { icon: '📍', title: 'Localização', content: 'São Paulo, SP' },
            { icon: '📞', title: 'Telefone', content: '+55 (11) 9999-9999' },
            { icon: '✉️', title: 'Email', content: 'contato@dommus.com.br' },
          ].map((contact, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(107, 70, 193, 0.3)' }}
              className="p-6 rounded-2xl bg-white/10 border border-white/20 text-center hover:bg-white/15 transition-all backdrop-blur-sm"
            >
              <div className="text-3xl mb-2">{contact.icon}</div>
              <h4 className="font-bold text-sm uppercase text-gray-300 mb-1">{contact.title}</h4>
              <p className="text-white font-medium">{contact.content}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-black/80 text-white py-8 border-t border-white/10 backdrop-blur-sm"
      >
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <p className="text-center md:text-left text-sm text-gray-400">
              © 2024 Dommus Smart Home. Todos os direitos reservados.
            </p>

            <div className="flex justify-center md:justify-end gap-6">
              {['Privacidade', 'Termos', 'Cookies', 'Acessibilidade'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm text-gray-400 hover:text-dommus-secondary transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
