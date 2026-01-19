/**
 * Converte uma string de data (YYYY-MM-DD) para um objeto Date,
 * preservando o dia independentemente do fuso horário.
 */
export function parseLocalDate(dateString: string): Date {
  // Parseamos a data e obtemos os componentes (ano, mês, dia)
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Criamos uma nova data no fuso horário local, garantindo que o dia seja preservado
  const date = new Date();
  date.setFullYear(year, month - 1, day); // O mês é 0-indexed em JavaScript
  date.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de fuso
  
  return date;
}

/**
 * Formata uma data para o formato YYYY-MM-DD para uso em inputs do tipo date
 */
export function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth é 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formata uma data para o formato de API, garantindo que o dia seja preservado
 */
export function formatDateForAPI(date: Date | null): string | null {
  if (!date) return null;
  
  // Clonamos a data para não modificar o original
  const clonedDate = new Date(date);
  // Fixamos o horário para meio-dia para evitar problemas de fuso
  clonedDate.setHours(12, 0, 0, 0);
  
  return clonedDate.toISOString();
}

/**
 * Converte uma data de API para uma data local
 */
export function parseAPIDate(dateString: string | null): Date | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  // Fixamos o horário para meio-dia para evitar problemas de fuso
  date.setHours(12, 0, 0, 0);
  
  return date;
} 