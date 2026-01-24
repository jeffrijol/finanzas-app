import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

export type StrengthLevel = 'weak' | 'medium' | 'strong';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className = '' }: PasswordStrengthMeterProps) {
  const { strength, score, feedback } = useMemo(() => {
    if (!password) {
      return { strength: 'weak' as StrengthLevel, score: 0, feedback: '' };
    }

    let points = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (checks.length) points++;
    if (checks.lowercase && checks.uppercase) points++;
    if (checks.number) points++;
    if (checks.special) points++;

    let strengthLevel: StrengthLevel;
    let feedbackText: string;

    if (points <= 1) {
      strengthLevel = 'weak';
      feedbackText = 'Contraseña débil';
    } else if (points <= 2) {
      strengthLevel = 'medium';
      feedbackText = 'Contraseña media';
    } else {
      strengthLevel = 'strong';
      feedbackText = 'Contraseña fuerte';
    }

    const scorePercentage = (points / 4) * 100;

    return { strength: strengthLevel, score: scorePercentage, feedback: feedbackText };
  }, [password]);

  const getColor = () => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
    }
  };

  const getTextColor = () => {
    switch (strength) {
      case 'weak':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'strong':
        return 'text-green-600';
    }
  };

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <Progress value={score} className="h-1.5" />
        <div
          className={`absolute inset-0 h-1.5 rounded-full transition-all ${getColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`text-xs font-medium ${getTextColor()}`}>
        {feedback}
      </p>
      <div className="text-xs text-muted-foreground space-y-0.5">
        <p className={password.length >= 8 ? 'line-through opacity-60' : ''}>
          • Al menos 8 caracteres
        </p>
        <p className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'line-through opacity-60' : ''}>
          • Mayúsculas y minúsculas
        </p>
        <p className={/\d/.test(password) ? 'line-through opacity-60' : ''}>
          • Al menos un número
        </p>
        <p className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'line-through opacity-60' : ''}>
          • Caracteres especiales (!@#$%...)
        </p>
      </div>
    </div>
  );
}
