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
 * @param {string} params.additionalContext - Extra context/instructions from user
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

    const client = getOpenAIClient();

    // Build highlights section
    const highlightsText = highlights.length > 0 
        ? `Points clés à mentionner : ${highlights.join(', ')}\n`
        : '';

    // Build context section - user instructions are CRITICAL
    const contextSection = additionalContext 
        ? `Instructions spécifiques de l'utilisateur : ${additionalContext}\n`
        : '';

    const prompt = `Tu es un expert en prospection B2B et copywriting. Génère un message de prospection court et percutant.

INFORMATIONS DE BASE:
- Contact : ${name}
- Entreprise : ${company}
- Objectif : ${objective}
- Ton souhaité : ${tone}

${highlightsText}${contextSection}
INSTRUCTIONS IMPORTANTES :
- Le message doit être personnalisé et authentique, jamais automatisé
- Inclus un appel à l'action clair
- Maximum 3-4 paragraphes
- Écris en français
${contextSection ? '- Intègre les instructions de l\'utilisateur comme priorité absolue' : ''}

Génère UNIQUEMENT le message, sans explications ni commentaires.`;

    try {
        const message = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Tu es un expert en prospection B2B. Tes messages sont authentiques, percutants et alignés aux instructions reçues. Tu respectes STRICTEMENT les demandes spécifiques de l\'utilisateur.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.8, // Augmenté pour plus de créativité et respect des instructions
            max_tokens: 500,
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
