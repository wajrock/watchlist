/* eslint-disable quote-props */
/* eslint-disable object-curly-spacing */
/* eslint-disable max-len */
/* eslint-disable quotes */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export const searchMedias = onCall(
    {
        secrets: ['GEMINI_API_KEY', 'TMDB_API_KEY'],
        cors: true,
        memory: '512MiB',
        timeoutSeconds: 60,
    },
    async (request) => {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
        const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        const contentType = request.data?.type;
        const userQuery = request.data?.query;

        if (!userQuery || typeof userQuery !== 'string') {
            throw new HttpsError('invalid-argument', "A valid 'query' string must be provided.");
        }

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

            const prompt = `
                Tu es un expert en cinéma et séries TV.
                Donne moi exactement 9 titres de ${contentType === 'tv' ? 'séries' : 'films'} qui correspondent le mieux à cette description : "${userQuery}"

                RÈGLES :
                - Choisis des titres connus et reconnaissables
                - Si une nationalité est mentionnée, respecte-la
                - Si une période est mentionnée, respecte-la
                - Privilégie la pertinence à la popularité

                Réponds UNIQUEMENT en JSON valide, sans markdown, sans explication :
                ["Titre 1", "Titre 2", "Titre 3", "Titre 4", "Titre 5", "Titre 6", "Titre 7", "Titre 8", "Titre 9"]
                
                Si tu ne trouves rien de cohérent ou s'il y a un problème, renvoie uniquement un tableau vide : []`;

            const geminiResult = await model.generateContent(prompt);
            const geminiText = geminiResult.response.text();

            logger.info('Gemini titles', { geminiText });

            const titles: string[] = JSON.parse(geminiText);

            const searchResults = await Promise.all(
                titles.map((title) =>
                    axios.get(`https://api.themoviedb.org/3/search/${contentType}`, {
                        params: { api_key: TMDB_API_KEY, query: title, language: 'fr-FR' },
                    }),
                ),
            );

            const medias = searchResults.map((r) => r.data.results[0]).filter(Boolean);

            return { success: true, medias };
        } catch (error) {
            logger.error('searchMedias error:', error);
            throw new HttpsError('internal', 'An error occurred while searching medias.');
        }
    },
);
