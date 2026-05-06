import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else {
      setError('Veuillez entrer un mot de passe');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-black border border-zinc-900 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic tracking-wider text-white">
            BIYO <span className="text-red-600">YAMAHA</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Administration</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">Mot de passe de sécurité</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-zinc-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                placeholder="Mot de passe (admin)"
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-600/20"
          >
            Se Connecter
          </button>
        </form>
      </div>
    </div>
  );
}
