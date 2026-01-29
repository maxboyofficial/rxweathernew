
import React, { useState } from 'react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !email) return alert("Please fill all fields");
    if (!email.includes("@")) return alert("Please enter a valid email");

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onLogin({ nickname, email });
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[40px] p-10 text-center relative animate-in zoom-in-95 duration-500 shadow-2xl overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[100px] pointer-events-none" />
        
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 text-2xl opacity-40 hover:opacity-100 hover:rotate-90 hover:scale-125 transition-all duration-300 active:scale-90"
        >
          &times;
        </button>
        
        {!loading && !success && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-fingerprint text-blue-500 text-3xl" />
            </div>
            <h2 className="text-3xl font-black mb-2 tracking-tighter">Welcome</h2>
            <p className="text-xs font-medium opacity-40 mb-10 uppercase tracking-widest">Identify Yourself</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative group">
                <i className="fas fa-user absolute left-5 top-1/2 -translate-y-1/2 text-xs opacity-30 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Nickname" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all duration-300"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              <div className="relative group">
                <i className="fas fa-at absolute left-5 top-1/2 -translate-y-1/2 text-xs opacity-30 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="Google Email" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 py-4.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20 mt-4 group">
                Continue <i className="fas fa-arrow-right ml-2 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        )}

        {loading && (
          <div className="py-12 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-shield-halved text-blue-500 animate-pulse" />
              </div>
            </div>
            <p className="text-blue-400 font-black uppercase text-[10px] tracking-[0.3em]">Validating Access...</p>
          </div>
        )}

        {success && (
          <div className="py-12 flex flex-col items-center animate-in zoom-in duration-700">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-2xl shadow-green-500/10">
              <i className="fas fa-check-circle animate-[bounce_0.5s_ease-in-out_infinite]" />
            </div>
            <p className="text-2xl font-black tracking-tighter mb-2">Access Granted</p>
            <p className="text-xs opacity-40 font-bold uppercase tracking-widest">Preparing your board...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
