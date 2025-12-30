import { Resend } from 'resend';

// Initialisation du client Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuration de l'email
const FROM_EMAIL = process.env.EMAIL_FROM || 'SweetLook <noreply@sweetlook.dz>';
const APP_NAME = 'SweetLook';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Envoie un email via Resend
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
            text,
        });

        if (error) {
            console.error('Erreur envoi email:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Erreur envoi email:', error);
        return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
    }
}

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<{ success: boolean; error?: string }> {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de mot de passe</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${APP_NAME}</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                    Réinitialisation de votre mot de passe
                  </h2>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Bonjour,
                  </p>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                  </p>
                  
                  <!-- CTA Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" 
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4);">
                          Réinitialiser mon mot de passe
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Ce lien est valable pendant <strong>1 heure</strong>. Après ce délai, vous devrez faire une nouvelle demande.
                  </p>
                  
                  <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
                  </p>
                  
                  <!-- Alternative Link -->
                  <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${resetUrl}" style="color: #ec4899; font-size: 13px; text-decoration: underline;">
                        ${resetUrl}
                      </a>
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; color: #9ca3af; font-size: 13px;">
                    © ${new Date().getFullYear()} ${APP_NAME}. Tous droits réservés.
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

    const text = `
    Réinitialisation de votre mot de passe - ${APP_NAME}

    Bonjour,

    Vous avez demandé à réinitialiser votre mot de passe.
    
    Cliquez sur ce lien pour créer un nouveau mot de passe :
    ${resetUrl}

    Ce lien est valable pendant 1 heure.

    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

    © ${new Date().getFullYear()} ${APP_NAME}
  `;

    return sendEmail({
        to: email,
        subject: `Réinitialisation de votre mot de passe - ${APP_NAME}`,
        html,
        text,
    });
}
