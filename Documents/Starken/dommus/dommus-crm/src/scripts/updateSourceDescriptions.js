import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../../.env') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSourceDescriptions() {
  try {
    const sourceUpdates = [
      { name: 'Website', description: 'Leads that came from the company website' },
      { name: 'Social Media', description: 'Leads from social media platforms' },
      { name: 'LinkedIn', description: 'Leads from LinkedIn prospecting' },
      { name: 'Referral', description: 'Leads that were referred by existing clients' },
      { name: 'Cold Call', description: 'Leads that were acquired through cold calling' },
      { name: 'Email Campaign', description: 'Leads that came from email marketing campaigns' },
      { name: 'Trade Show', description: 'Leads that were acquired at trade shows or events' },
      { name: 'Partner', description: 'Leads that came through business partners' },
      { name: 'Other', description: 'Leads from other sources' }
    ];

    for (const source of sourceUpdates) {
      const { error } = await supabase
        .from('lead_sources')
        .update({ description: source.description })
        .eq('name', source.name);

      if (error) {
        console.error(`Error updating description for ${source.name}:`, error);
      } else {
        console.log(`Successfully updated description for ${source.name}`);
      }
    }

    console.log('Source descriptions update completed');
  } catch (error) {
    console.error('Error during update:', error);
  }
}

updateSourceDescriptions(); 