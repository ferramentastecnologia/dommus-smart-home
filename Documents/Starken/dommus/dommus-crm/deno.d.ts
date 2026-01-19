// Definição de tipos para as APIs do Deno
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;
}

// Permitir importações de módulos do Deno
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.38.4" {
  export function createClient(url: string, key: string, options?: any): any;
}

declare module "npm:nodemailer@6.9.9" {
  export function createTransport(options: any): {
    sendMail(mailOptions: any): Promise<any>;
  };
} 