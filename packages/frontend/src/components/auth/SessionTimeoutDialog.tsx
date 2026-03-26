import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';

interface SessionTimeoutDialogProps {
  open: boolean;
  timeLeft: string;
  onKeepActive: () => void;
}

export function SessionTimeoutDialog({ open, timeLeft, onKeepActive }: SessionTimeoutDialogProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tu sesión está por expirar</AlertDialogTitle>
          <AlertDialogDescription>
            Tu sesión expirará en <strong>{timeLeft}</strong>. ¿Deseas mantener tu sesión activa?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogout}>
            Cerrar sesión
          </AlertDialogCancel>
          <AlertDialogAction onClick={onKeepActive}>
            Mantener activa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
