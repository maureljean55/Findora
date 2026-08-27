export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[0-9\s().-]{8,}$/;

export function normalizePhone(value: string): string {
  return value.replace(/[\s().-]/g, '');
}

export function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Email/téléphone ou mot de passe incorrect.';
  }
  if (message.includes('already registered') || message.includes('already exists')) {
    return 'Un compte existe déjà avec cet email ou ce numéro.';
  }
  if (message.toLowerCase().includes('password')) {
    return 'Le mot de passe ne respecte pas les critères requis (6 caractères minimum).';
  }
  if (message.toLowerCase().includes('network')) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
  }
  return 'Une erreur est survenue. Réessayez.';
}
