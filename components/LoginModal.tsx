import React, { useState } from 'react';
import { useStore } from '../store';
import { Lock, X, KeyRound, ArrowLeft } from 'lucide-react';
import { ADMIN_PASSWORD, RECOVERY_CODE } from '../constants';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { setCurrentUser, verifyPassword, changePassword } = useStore();
  const [password, setPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [error, setError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPassword(password)) {
      setCurrentUser('owner');
      onClose();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleReset = (e: React.FormEvent) => {
      e.preventDefault();
      if (recoveryCode.toLowerCase() === RECOVERY_CODE) {
          changePassword(ADMIN_PASSWORD);
          setSuccessMsg('Password reset to default!');
          setTimeout(() => {
              setSuccessMsg('');
              setMode('login');
              setPassword('');
          }, 1500);
      } else {
          setError(true);
          setTimeout(() => setError(false), 2000);
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden relative">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-500 hover:text-black z-10"
        >
            <X className="w-5 h-5" />
        </button>
        
        <div className="p-6">
            <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 text-[#0A66C2]">
                    {mode === 'login' ? <Lock className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                    {mode === 'login' ? 'Admin Access' : 'Reset Password'}
                </h3>
                <p className="text-sm text-gray-500 text-center mt-1">
                    {mode === 'login' 
                        ? 'Enter the passcode to edit your profile and view messages.' 
                        : 'Enter the recovery code to reset your password to default.'}
                </p>
            </div>

            {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input 
                            type="password"
                            autoFocus
                            placeholder="Enter password"
                            className={`w-full border rounded-lg p-3 outline-none transition-all ${
                                error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]'
                            }`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p className="text-xs text-red-600 mt-1 ml-1">Incorrect password.</p>}
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-[#0A66C2] text-white py-2.5 rounded-full font-bold hover:bg-[#004182] transition-colors"
                    >
                        Sign In
                    </button>
                    <div className="text-center">
                        <button 
                            type="button"
                            onClick={() => { setMode('forgot'); setError(false); }}
                            className="text-xs text-[#0A66C2] hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleReset} className="space-y-4">
                     <div>
                        <input 
                            type="text"
                            autoFocus
                            placeholder="Recovery Code"
                            className={`w-full border rounded-lg p-3 outline-none transition-all ${
                                error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]'
                            }`}
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                        />
                         {error && <p className="text-xs text-red-600 mt-1 ml-1">Invalid recovery code.</p>}
                         {successMsg && <p className="text-xs text-green-600 mt-1 ml-1 font-bold">{successMsg}</p>}
                    </div>
                     <button 
                        type="submit"
                        className="w-full bg-[#0A66C2] text-white py-2.5 rounded-full font-bold hover:bg-[#004182] transition-colors"
                    >
                        Reset Password
                    </button>
                    <div className="text-center">
                        <button 
                            type="button"
                            onClick={() => { setMode('login'); setError(false); }}
                            className="text-xs text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to Login
                        </button>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400">
                            Hint: Try 'recovery'
                        </p>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;