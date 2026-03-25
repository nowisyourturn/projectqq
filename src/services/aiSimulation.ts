export const simulateAIResponse = async (message: string): Promise<string> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("salut") || lowerMessage.includes("bună")) {
    return "Salut! Sunt asistentul tău EverestStudy. Cum te pot ajuta astăzi cu engleza ta?";
  }

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello there! It's great to see you practicing your English. Do you have any questions about the current lesson?";
  }

  if (lowerMessage.includes("ajutor") || lowerMessage.includes("help")) {
    return "Sigur! Te pot ajuta să înțelegi gramatica, să exersezi vocabularul sau să corectez frazele tale. Ce anume te interesează?";
  }

  if (lowerMessage.includes("exercițiu") || lowerMessage.includes("practice")) {
    return "Hai să facem un exercițiu rapid! Cum se spune 'Bună dimineața' în engleză?";
  }

  if (lowerMessage.includes("good morning")) {
    return "Exact! 'Good morning' este corect. Foarte bine! Vrei să mai încercăm unul?";
  }

  if (lowerMessage.includes("mulțumesc") || lowerMessage.includes("thanks")) {
    return "Cu mare plăcere! Sunt aici oricând ai nevoie de ajutor.";
  }

  return "Interesant! Poți să-mi spui mai multe despre asta? Încerc să învăț și eu cum să te ajut mai bine.";
};
