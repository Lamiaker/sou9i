import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(1, { message: "Mot de passe requis" }),
    captchaToken: z.string().optional(),
})

export const registerSchema = z.object({
    name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
    email: z.string().email({ message: "Email invalide" }),
    password: z
        .string()
        .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
        .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une majuscule" })
        .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une minuscule" })
        .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre" }),
    phone: z.string().regex(/^(?:\+213|0)(5|6|7)[0-9]{8}$/, { message: "Format invalide (ex: 0555123456 ou +213555123456)" }),
    city: z.string().min(2, { message: "La ville est requise" }),
    captchaToken: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
