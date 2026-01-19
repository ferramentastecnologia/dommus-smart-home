import { supabase } from '../services/supabase/client';

async function translateSources() {
  try {
    const translations = [
      { from: 'Site', to: 'Website', description: 'Leads that came from the company website' },
      { from: 'Redes Sociais', to: 'Social Media', description: 'Leads from social media platforms' },
      { from: 'Indicação', to: 'Referral', description: 'Leads that were referred by existing clients' },
      { from: 'Ligação', to: 'Cold Call', description: 'Leads that were acquired through cold calling' },
      { from: 'Campanha de Email', to: 'Email Campaign', description: 'Leads that came from email marketing campaigns' },
      { from: 'Feira', to: 'Trade Show', description: 'Leads that were acquired at trade shows or events' },
      { from: 'Evento', to: 'Trade Show', description: 'Leads that were acquired at trade shows or events' },
      { from: 'Parceiro', to: 'Partner', description: 'Leads that came through business partners' },
      { from: 'Outros', to: 'Other', description: 'Leads from other sources' }
    ];

    for (const translation of translations) {
      const { error } = await supabase
        .from('lead_sources')
        .update({
          name: translation.to,
          description: translation.description
        })
        .eq('name', translation.from);

      if (error) {
        console.error(`Error updating ${translation.from}:`, error);
      } else {
        console.log(`Successfully translated ${translation.from} to ${translation.to}`);
      }
    }

    console.log('Translation completed');
  } catch (error) {
    console.error('Error during translation:', error);
  }
}

translateSources(); 