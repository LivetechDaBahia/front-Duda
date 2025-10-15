import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface MFAInputProps {
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
}

export function MFAInput({ onVerify, onCancel }: MFAInputProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      await onVerify(code);
    } catch (err) {
      setError('Invalid authentication code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <div className="rounded-full bg-primary/10 p-3">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Two-Factor Authentication</h2>
        <p className="text-center text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Authentication Code</Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl tracking-widest"
            autoComplete="one-time-code"
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={code.length !== 6 || isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </form>
    </div>
  );
}
