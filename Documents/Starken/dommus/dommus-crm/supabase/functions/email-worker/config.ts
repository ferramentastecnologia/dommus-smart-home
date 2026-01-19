// Configuração da função Edge do Supabase
export const config = {
  // Permitir acesso a hosts externos (SMTP, etc.)
  external: true,
  // Permitir acesso a variáveis de ambiente
  env: {
    // Lista de variáveis de ambiente necessárias
    SUPABASE_URL: "string",
    SUPABASE_SERVICE_ROLE_KEY: "string",
    FUNCTION_SECRET: "string"
  }
};