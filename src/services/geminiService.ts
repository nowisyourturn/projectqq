import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { UserProfile, Subject, TestQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateTest(userProfile: UserProfile, lessonTitle: string): Promise<TestQuestion[]> {
  const prompt = `
    Generează un test de 5 exerciții pentru un elev de clasa a 9-a din Republica Moldova la disciplina ${userProfile.subject}, lecția "${lessonTitle}".
    Personalizează exercițiile folosind interesul elevului (${userProfile.interestCategory}: ${userProfile.interestDetail}).
    Returnează un array JSON de obiecte cu proprietățile: id (number), question (string), hint (string).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.NUMBER },
            question: { type: Type.STRING },
            hint: { type: Type.STRING }
          },
          required: ["id", "question"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse test questions", e);
    return [];
  }
}

export async function evaluateAnswer(
  userProfile: UserProfile,
  question: string,
  answer: string,
  imageData?: string // base64
) {
  const parts: any[] = [
    { text: `Evaluează răspunsul elevului la întrebarea: "${question}".` },
    { text: `Răspuns text: "${answer}"` }
  ];

  if (imageData) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageData.split(',')[1] || imageData
      }
    });
    parts.push({ text: "Analizează și imaginea încărcată cu rezolvarea." });
  }

  const systemInstruction = `
    Ești un profesor corect dar încurajator din Republica Moldova. 
    Evaluează răspunsul elevului (text și/sau imagine).
    Dacă e corect, felicită-l folosind o analogie din ${userProfile.interestCategory}.
    Dacă e greșit, explică-i unde a greșit și oferă-i un indiciu socratic pentru a încerca din nou.
    Fii scurt și la obiect.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts }],
    config: { systemInstruction }
  });

  return response.text;
}

export async function getTutorResponse(
  userProfile: UserProfile,
  lessonTitle: string,
  userMessage: string,
  chatHistory: { role: 'user' | 'model', parts: { text: string }[] }[] = []
) {
  const systemInstruction = `
    Ești un Tutore Inteligent personalizat pentru un elev de clasa a 9-a din Republica Moldova care se pregătește pentru examenul de ${userProfile.subject}.
    
    PROFIL ELEV:
    - Disciplină: ${userProfile.subject}
    - Interes: ${userProfile.interestCategory}
    - Detaliu interes: ${userProfile.interestDetail}
    
    PROTOCOL DE INTERACȚIUNE:
    1. CONTEXTUALIZARE: Explică conceptele dificile din lecția "${lessonTitle}" folosind analogii din interesul elevului (${userProfile.interestCategory}: ${userProfile.interestDetail}). 
       - Dacă interesul este Gaming, folosește mecanici de joc, nivele, strategii.
       - Dacă este Filme, folosește scenarii, personaje, regie.
       - Dacă este Sport, folosește antrenamente, competiții, tactici.
    2. DIALOG SOCRATIC: Nu oferi răspunsuri directe imediat. Pune întrebări care să ghideze elevul spre descoperirea proprie a soluției.
    3. EVALUARE FORMATIVĂ: Verifică înțelegerea prin întrebări scurte și feedback constructiv.
    
    TON:
    - Prietenos, adaptat adolescenților (15-16 ani).
    - Motivațional, cald, dar menține rigoarea academică necesară curriculumului din Moldova.
    - Folosește un limbaj modern, dar corect gramatical.
    
    LIMBĂ: Română.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...chatHistory.map(h => ({ role: h.role, parts: h.parts })),
      { role: 'user', parts: [{ text: userMessage }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  return response.text;
}
