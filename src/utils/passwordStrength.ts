export interface PasswordStrength {
  strength: number;
  label: string;
  color: string;
}

const LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

export function calculatePasswordStrength(password: string): PasswordStrength {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const idx = Math.min(strength, 4);
  return { strength, label: LABELS[idx], color: COLORS[idx] };
}
