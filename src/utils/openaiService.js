import OpenAI from 'openai';

let openai = null;

function getOpenAIClient() {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not configured');
        }
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openai;
}

/**
 * Generate a prospection message using OpenAI
 * @param {Object} params
 * @param {string} params.name - Contact name
 * @param {string} params.company - Contact company
 * @param {string} params.tone - Tone of message
 * @param {string} params.objective - Message objective
 * @param {string[]} params.highlights - Key points
 * @param {string} params.additionalContext - Extra context
 * @returns {Promise<string>} Generated message
 */
export async function generateMessageWithAI({
    name,
    company,
    tone = 'Professionnel & cordial',
    objective = 'Prise de rendez-vous',
    highlights = [],
    additionalContext = ''
}) {
    if (!name || !company) {
        throw new Error('name and company are required');
    }

    const highlightsText = highlights.length > 0 
        ? `Points clés : ${highlights.join(', ')}`
        : '';

    const prompt = `Génère un message de prospection court et percutant pour :
- Contact : ${name}
- Entreprise : ${company}
- Objectif : ${objective}
- Ton : ${tone}
${highlightsText}
${additionalContext ? `- Contexte : ${additionalContext}` : ''}

Le message doit être :
- Court (2-3 paragraphes max)
- Personnel et non automatisé
- Avec un appel à l'action clair
- En français

Génère uniquement le message, sans explications.`;

    try {
        const client = getOpenAIClient();
        const message = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Tu es expert en prospection B2B et copywriting. Génère des messages courts, percutants et personnalisés.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 400,
        });

        const content = message.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content generated');
        }

        return content.trim();
    } catch (error) {
        console.error('OpenAI error:', error);
        throw new Error(`Erreur génération IA: ${error.message}`);
    }
}
