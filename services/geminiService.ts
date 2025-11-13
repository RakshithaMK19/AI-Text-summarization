import { GoogleGenAI } from "@google/genai";
import { SummaryLength } from '../types';

const getPrompt = (text: string, length: SummaryLength): string => {
    let lengthInstruction = '';
    switch (length) {
        case SummaryLength.SHORT:
            lengthInstruction = 'a few concise sentences (around 50 words)';
            break;
        case SummaryLength.MEDIUM:
            lengthInstruction = 'a detailed paragraph (around 150 words)';
            break;
        case SummaryLength.LONG:
            lengthInstruction = 'several detailed paragraphs (around 300 words)';
            break;
    }

    return `Please provide an abstractive summary of the following article. The summary should capture the key points and main ideas in your own words, rather than just extracting sentences. The desired length is ${lengthInstruction}.

ARTICLE:
---
${text}
---

SUMMARY:`;
};

export const summarizeText = async (text: string, length: SummaryLength): Promise<string> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable is not set.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const model = 'gemini-2.5-flash';
        const prompt = getPrompt(text, length);

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error summarizing text:", error);
        if (error instanceof Error) {
            return `Failed to generate summary. Error: ${error.message}`;
        }
        return "An unknown error occurred while generating the summary.";
    }
};
