// app/salles/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useSallesStore } from "@/lib/stores";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";

// Modal d'ajout/modification de salle
function SalleModal({ salle, onSave, onClose }: any) {
  const [form, setForm] = useState({
    nom: salle?.nom || "",
    capacite: salle?.capacite || 0,
    batiment: salle?.batiment || "",
    equipements: salle?.equipements?.join(", ") || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const equipementsArray = form.equipements.split(",").map((item: string) => item.trim()).filter(Boolean);
    onSave({
      nom: form.nom,
      capacite: Number(form.capacite),
      batiment: form.batiment,
      equipements: equipementsArray,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{salle ? "Modifier" : "Ajouter"} une salle</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label>Nom de la salle</label><input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Capacité (nombre d'élèves)</label><input type="number" required value={form.capacite} onChange={e => setForm({...form, capacite: parseInt(e.target.value)})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Bâtiment</label><input required value={form.batiment} onChange={e => setForm({...form, batiment: e.target.value})} className="w-full border rounded-xl p-2" /></div>
          <div><label>Équipements (séparés par des virgules)</label><input value={form.equipements} onChange={e => setForm({...form, equipements: e.target.value})} className="w-full border rounded-xl p-2" placeholder="ex: tableau, vidéoprojecteur" /></div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold">Enregistrer</button>
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-xl">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SallesPage() {
  const [salles, setSalles] = useSallesStore();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const filtered = useMemo(() => {
    return salles.filter((s: any) => s.nom.toLowerCase().includes(search.toLowerCase()));
  }, [salles, search]);

  const saveSalle = (data: any) => {
    if (editing) {
      setSalles(salles.map((s: any) => s.id === editing.id ? { ...editing, ...data } : s));
    } else {
      const newId = (Math.max(...salles.map((s: any) => parseInt(s.id)), 0) + 1).toString();
      setSalles([...salles, { id: newId, ...data }]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const deleteSalle = (id: string) => {
    if (confirm("Supprimer cette salle définitivement ?")) {
      setSalles(salles.filter((s: any) => s.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Gestion des salles</h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-200 flex items-center gap-2">
          <Plus size={18}/> Nouvelle salle
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Rechercher une salle..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-32" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-48" />
              <col className="w-24" />
            </colgroup>
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-left">Capacité</th>
                <th className="p-3 text-left">Bâtiment</th>
                <th className="p-3 text-left">Équipements</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-medium">{s.nom}</td>
                  <td className="p-3">{s.capacite} él.</td>
                  <td className="p-3">{s.batiment}</td>
                  <td className="p-3 text-slate-500">{s.equipements?.join(", ") || "—"}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditing(s); setShowModal(true); }} className="p-1 text-slate-400 hover:text-blue-500"><Edit size={16}/></button>
                      <button onClick={() => deleteSalle(s.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <p className="text-slate-400">Aucune salle trouvée.</p>
        </div>
      )}

      {showModal && (
        <SalleModal
          salle={editing}
          onSave={saveSalle}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}