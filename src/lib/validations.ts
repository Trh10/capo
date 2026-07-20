import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  role: z.enum(["STUDENT", "TEACHER"], {
    errorMap: () => ({ message: "Choisissez un type de compte" }),
  }),
  specialty: z.string().optional(),
  avatarUrl: z
    .union([
      z.string().url(),
      z.string().regex(/^\/uploads\/.+/),
      z.literal(""),
    ])
    .optional(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  avatarUrl: z
    .union([
      z.string().url(),
      z.string().regex(/^\/uploads\/.+/),
      z.literal(""),
    ])
    .optional(),
  bio: z.string().max(1000).optional(),
  specialty: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  deviceName: z.string().optional(),
  deviceType: z.enum(["WEB", "MOBILE", "DESKTOP"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const checkoutSchema = z.object({
  courseSlug: z.string().min(1, "Cours requis"),
});

export const progressSchema = z.object({
  watchedSec: z.number().min(0),
  completed: z.boolean().optional(),
});

export const startConversationSchema = z.object({
  courseId: z.string().min(1, "Cours requis"),
  teacherUserId: z.string().min(1, "Professeur requis"),
  message: z
    .string()
    .trim()
    .min(1, "Message requis")
    .max(2000, "Message trop long (max. 2000 caractères"),
});

export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message requis")
    .max(2000, "Message trop long (max. 2000 caractères"),
});

const contentUrlSchema = z.union([
  z.string().url("URL invalide"),
  z.string().regex(/^\/uploads\/.+/, "Chemin de fichier invalide"),
  z.literal(""),
]);

const contentTypeSchema = z.enum([
  "VIDEO",
  "DOCUMENT",
  "BOOK",
  "SYLLABUS",
  "AUDIO",
  "RESOURCE",
]);

export const createCourseSchema = z.object({
  title: z.string().min(3, "Titre requis (min. 3 caractères)"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().min(20, "Description requise (min. 20 caractères)"),
  shortDesc: z.string().max(200).optional(),
  thumbnailUrl: z
    .union([
      z.string().url("URL invalide"),
      z.string().regex(/^\/uploads\/.+/, "Chemin de fichier invalide"),
      z.literal(""),
    ])
    .optional(),
  price: z.number().min(0, "Prix invalide"),
  level: z.string().min(2, "Niveau requis"),
  categoryName: z.string().optional(),
  categoryId: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createLessonSchema = z.object({
  title: z.string().min(2, "Titre requis"),
  contentType: contentTypeSchema.default("VIDEO"),
  videoUrl: contentUrlSchema.optional(),
  durationMin: z.number().min(1, "Durée minimale : 1 minute"),
  isFree: z.boolean().optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().min(2).optional(),
  contentType: contentTypeSchema.optional(),
  videoUrl: contentUrlSchema.optional(),
  durationMin: z.number().min(1).optional(),
  isFree: z.boolean().optional(),
  direction: z.enum(["up", "down"]).optional(),
});
