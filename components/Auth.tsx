
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
  const [focusType, setFocusType] = useState<'text' | 'password' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!nickname || !email) {
      setError("Please fill all fields");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ nickname, email });
      onClose();
    }, 1500);
  };

  // Panda dynamic styles
  const handlStyle: React.CSSProperties = focusType === 'password' ? {
    transform: 'rotate(-150deg)',
    top: '70px',
    left: '105px',
    height: '90px',
    width: '40px'
  } : {
    transform: 'rotate(0deg)',
    top: '150px',
    left: '40px',
    height: '45px',
    width: '35px'
  };

  const handrStyle: React.CSSProperties = focusType === 'password' ? {
    transform: 'rotate(150deg)',
    top: '70px',
    right: '105px',
    height: '90px',
    width: '40px'
  } : {
    transform: 'rotate(0deg)',
    top: '150px',
    right: '40px',
    height: '45px',
    width: '35px'
  };

  const eyeball1Style: React.CSSProperties = focusType === 'text' ? {
    top: '20px',
    left: '13px'
  } : {
    top: '10px',
    left: '10px'
  };

  const eyeball2Style: React.CSSProperties = focusType === 'text' ? {
    top: '20px',
    left: '8px'
  } : {
    top: '10px',
    left: '10px'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="panda-login-container relative shadow-2xl animate-in zoom-in-95 duration-500">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl z-50 transition-colors"
        >
          <i className="fas fa-times" />
        </button>

        <div className="panda-backg">
          <div className="panda-face">
            <div className="panda-earl"></div>
            <div className="panda-earr"></div>
            <div className="panda-blshl"></div>
            <div className="panda-blshr"></div>
            <div className="panda-eyel">
              <div className="panda-eyeball1" style={eyeball1Style}></div>
            </div>
            <div className="panda-eyer">
              <div className="panda-eyeball2" style={eyeball2Style}></div>
            </div>
            <div className="panda-nose">
              <div className="panda-line"></div>
            </div>
            <div className="panda-m">
              <div className="panda-m1"></div>
            </div>
            <div className="panda-mm">
              <div className="panda-m1"></div>
            </div>
          </div>
        </div>

        <div className="panda-handl" style={handlStyle}></div>
        <div className="panda-handr" style={handrStyle}></div>

        <div className="panda-pawl">
          <div className="panda-p1">
            <div className="panda-p2"></div>
            <div className="panda-p3"></div>
            <div className="panda-p4"></div>
          </div>
        </div>
        <div className="panda-pawr">
          <div className="panda-p1">
            <div className="panda-p2"></div>
            <div className="panda-p3"></div>
            <div className="panda-p4"></div>
          </div>
        </div>

        <div className="panda-login-form">
          <form onSubmit={handleLogin}>
            {error && (
              <div className="absolute top-2 left-0 right-0 text-center animate-in shake-in duration-300">
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{error}</p>
              </div>
            )}
            <div className="flex items-center mb-4 group">
              <i className="fa fa-user transition-transform group-focus-within:scale-125 group-focus-within:text-orange-500" aria-hidden="true"></i>
              <input 
                type="text" 
                placeholder="Nickname"
                className="transition-all duration-300"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onFocus={() => setFocusType('text')}
                onBlur={() => setFocusType(null)}
                required
              />
            </div>
            <div className="flex items-center mb-6 group">
              <i className="fa fa-unlock-alt transition-transform group-focus-within:scale-125 group-focus-within:text-orange-500" aria-hidden="true"></i>
              <input 
                type="password" 
                placeholder="Password (Email)"
                className="transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusType('password')}
                onBlur={() => setFocusType(null)}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`relative overflow-hidden group ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-orange-500/30'}`}
            >
              <span className={`flex items-center justify-center gap-2 transition-all duration-300 ${loading ? 'translate-y-10' : ''}`}>
                Login <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center animate-in slide-in-from-bottom-10">
                  <i className="fas fa-circle-notch animate-spin mr-2" /> Logging in...
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
