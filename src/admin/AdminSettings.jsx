import { Save } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Paramètres</h2>
        <p className="text-zinc-400 mt-1">Configurez les informations générales du site.</p>
      </div>

      <div className="bg-black border border-zinc-900 rounded-2xl p-6 md:p-8 max-w-3xl shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 border-b border-zinc-900 pb-4">Informations Générales</h3>
        <form className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Nom du magasin / Logo Textuel</label>
              <input type="text" defaultValue="Biyo Yamaha" className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2">Numéro de téléphone</label>
                <input type="text" defaultValue="+213 555 12 34 56" className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm font-medium mb-2">Email de contact</label>
                <input type="email" defaultValue="contact@biyoyamaha.com" className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-2">Adresse</label>
              <textarea rows="3" defaultValue="Alger, Algérie" className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-zinc-900">
            <button type="button" className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-600/20">
              <Save size={20} />
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
