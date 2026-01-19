// Declaração de tipos para o Deno
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Configuração do cron para processar a fila de emails a cada 15 minutos
export const schedule = "*/15 * * * *";
export const name = "email-worker";
export const authToken = Deno.env.get('FUNCTION_SECRET') || ''; 