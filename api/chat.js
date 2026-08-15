/**
 * Fonction serverless Vercel — relais vers l'API OpenRouter.
 * Déployée automatiquement sur /api/chat par Vercel.
 * Le fetch natif de Node est utilisé (pas besoin de node-fetch).
 */

import { createClient } from '@supabase/supabase-js';

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'poolside/laguna-xs-2.1:free';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  // --- Vérification de l'authentification ---
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié.' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'SUPABASE_URL / SUPABASE_ANON_KEY manquantes côté serveur.' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Session invalide ou expirée.' });
  }

  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Le champ "messages" est requis (tableau non vide).' });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY manquante côté serveur.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://vercel.app',
        'X-Title': 'Mon site de chat IA',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erreur API OpenRouter:', response.status, errText);
      return res.status(response.status).json({ error: 'Erreur côté fournisseur IA.', details: errText });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '(réponse vide)';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({ error: 'Erreur serveur interne.' });
  }
}
