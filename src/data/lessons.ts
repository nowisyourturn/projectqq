export interface Lesson {
  id: string;
  title: string;
  description: string;
  isFree: boolean;
  content: string;
  thumbnail: string;
}

export const lessons: Lesson[] = [
  {
    id: "1",
    title: "Introducere în Limba Engleză",
    description: "Învață primele cuvinte și expresii de bază în engleză.",
    isFree: true,
    content: "Bun venit la prima lecție! Astăzi vom învăța saluturile: Hello, Hi, Good morning.",
    thumbnail: "https://picsum.photos/seed/english1/400/300"
  },
  {
    id: "2",
    title: "Gramatica de Bază: Verbul 'To Be'",
    description: "Înțelege cum să folosești cel mai important verb din engleză.",
    isFree: false,
    content: "Verbul 'to be' are trei forme la prezent: am, is, are.",
    thumbnail: "https://picsum.photos/seed/english2/400/300"
  },
  {
    id: "3",
    title: "Vocabular: Familia și Prietenii",
    description: "Învață cum să-ți descrii familia și cercul de prieteni.",
    isFree: false,
    content: "Cuvinte cheie: Mother, Father, Brother, Sister, Friend.",
    thumbnail: "https://picsum.photos/seed/english3/400/300"
  },
  {
    id: "4",
    title: "Timpul Prezent Simplu",
    description: "Cum să vorbești despre activitățile tale zilnice.",
    isFree: false,
    content: "Present Simple se folosește pentru rutine și fapte generale.",
    thumbnail: "https://picsum.photos/seed/english4/400/300"
  }
];
