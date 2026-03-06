import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WHATSAPP_NUMBER = "5547992056515";

export const whatsappMessages = {
  navbarContato:
    "Olá! Vim pelo site da Dommus Smart Home e quero falar com a equipe sobre automação residencial.",
  heroSolicitarProjeto:
    "Olá! Vim pela landing page e quero solicitar um projeto personalizado de automação para meu espaço.",
  heroFalarEspecialista:
    "Olá! Vim pela landing page e gostaria de falar com um especialista para entender a melhor solução para meu caso.",
  parceiros:
    "Olá! Sou arquiteto(a)/construtora e tenho interesse em parceria com a Dommus Smart Home. Podemos conversar?",
  ctaFalarWhatsapp:
    "Olá! Vim pela landing page da Dommus Smart Home e quero descobrir a solução ideal para meu projeto.",
  ctaVerSolucoes:
    "Olá! Vim pela landing page e quero conhecer as soluções da Dommus Smart Home (automação, áudio, vídeo e infraestrutura).",
  footerWhatsapp:
    "Olá! Vim pelo site da Dommus Smart Home e quero atendimento pelo WhatsApp.",
} as const;

export type WhatsAppMessageKey = keyof typeof whatsappMessages;

export function getWhatsAppLink(messageKey: WhatsAppMessageKey) {
  const message = whatsappMessages[messageKey];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
