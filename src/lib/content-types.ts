import { LessonContentType } from "@prisma/client";

export const CONTENT_TYPE_OPTIONS: {
  value: LessonContentType;
  label: string;
  description: string;
}[] = [
  {
    value: "VIDEO",
    label: "Vidéo",
    description: "Cours filmé, tutoriel vidéo",
  },
  {
    value: "DOCUMENT",
    label: "Document",
    description: "PDF, fiche technique, support écrit",
  },
  {
    value: "BOOK",
    label: "Livre",
    description: "E-book, ouvrage numérique",
  },
  {
    value: "SYLLABUS",
    label: "Syllabus",
    description: "Programme, plan de cours, sommaire",
  },
  {
    value: "AUDIO",
    label: "Audio",
    description: "Podcast, enregistrement audio",
  },
  {
    value: "RESOURCE",
    label: "Ressource",
    description: "Template, fichier à télécharger",
  },
];

export function getContentTypeLabel(type: string): string {
  return CONTENT_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type;
}

export function isVideoContent(type: string): boolean {
  return type === "VIDEO";
}

export function getContentUrlLabel(type: string): string {
  switch (type) {
    case "VIDEO":
      return "Lien ou fichier vidéo";
    case "BOOK":
      return "Lien ou fichier livre (PDF, EPUB)";
    case "SYLLABUS":
      return "Lien ou fichier syllabus";
    case "AUDIO":
      return "Lien ou fichier audio";
    case "RESOURCE":
      return "Lien ou fichier ressource";
    default:
      return "Lien ou fichier document";
  }
}
