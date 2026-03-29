import React, { useState } from 'react';

interface AdminPanelProps {
  sandboxMode: boolean;
  onSandboxToggle: (enabled: boolean) => void;
  isAuthenticated: boolean;
  onAuthenticate: (authenticated: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  sandboxMode,
  onSandboxToggle,
  isAuthenticated,
  onAuthenticate
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  const handlePasswordSubmit = () => {
    setPasswordError(false);
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    
    if (!correctPassword) {
      setPasswordError(true);
      return;
    }

    if (passwordInput === correctPassword) {
      onAuthenticate(true);
      setPasswordInput('');
      localStorage.setItem('om_admin_auth', 'true');
      localStorage.setItem('om_admin_auth_time', Date.now().toString());
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    onAuthenticate(false);
    setPasswordInput('');
    localStorage.removeItem('om_admin_auth');
    localStorage.removeItem('om_admin_auth_time');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded border-2 border-blue-600 bg-black hover:bg-blue-600/10 transition-colors z-40 flex items-center justify-center shadow-xl text-blue-600 hover:text-blue-400"
        title="Admin Panel"
      >
        <i className="fas fa-cog text-xl"></i>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-zinc-950 border-2 border-blue-600/30 rounded shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fas fa-shield-alt text-white"></i>
          <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Admin Control</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white hover:text-gray-200 transition-colors"
          title="Minimize"
        >
          <i className="fas fa-minus text-lg"></i>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {!isAuthenticated ? (
          // Authentication Form
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter admin password"
                className={`w-full px-3 py-2 rounded border-2 bg-black text-white text-sm font-mono transition-colors ${
                  passwordError
                    ? 'border-red-600 focus:border-red-500'
                    : 'border-zinc-700 focus:border-blue-600'
                } focus:outline-none`}
              />
              {passwordError && (
                <p className="text-red-500 text-[9px] mt-1 font-black uppercase">
                  Invalid password
                </p>
              )}
            </div>

            <button
              onClick={handlePasswordSubmit}
              className="w-full px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-colors"
            >
              Unlock Admin
            </button>
          </div>
        ) : (
          // Admin Controls
          <div className="space-y-6">
            {/* Sandbox Mode Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-black text-white uppercase tracking-[0.2em]">
                    Sandbox Mode
                  </label>
                  <p className="text-[9px] text-zinc-500 mt-1">
                    Bypass payment & use production API
                  </p>
                </div>
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    sandboxMode ? 'bg-green-600' : 'bg-zinc-700'
                  }`}
                  onClick={() => onSandboxToggle(!sandboxMode)}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      sandboxMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </div>
              </div>

              {sandboxMode && (
                <div className="bg-green-950 border border-green-600/50 rounded px-3 py-2">
                  <p className="text-[9px] text-green-400 font-mono">
                    ✓ Sandbox active - Payment bypassed
                  </p>
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="border-t border-zinc-800 pt-4 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Status
              </p>
              <div className="space-y-1 text-[9px] text-zinc-400 font-mono">
                <p>
                  <span className="text-blue-400">API:</span> Production
                </p>
                <p>
                  <span className="text-blue-400">Auth:</span> Admin
                </p>
                <p>
                  <span className="text-blue-400">Sandbox:</span>{' '}
                  <span className={sandboxMode ? 'text-green-400' : 'text-zinc-500'}>
                    {sandboxMode ? 'ENABLED' : 'DISABLED'}
                  </span>
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded border-2 border-zinc-700 hover:border-red-600 text-zinc-400 hover:text-red-500 font-black uppercase text-[9px] tracking-[0.2em] transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
