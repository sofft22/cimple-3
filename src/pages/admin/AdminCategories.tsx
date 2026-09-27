import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Tag,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminCategories({ onNavigate }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (!error && data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"? Products in this category will become uncategorized.`))
      return;
    await supabase.from('categories').delete().eq('id', c.id);
    load();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/admin')}
            className="p-1 -ml-1 text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-pink-600 text-white text-sm font-semibold active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">No categories yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-pink-600 font-medium text-sm"
          >
            Add your first category
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3"
            >
              <div className="inline-flex w-10 h-10 rounded-xl bg-pink-50 items-center justify-center text-pink-600 flex-shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900">
                  {c.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditing(c);
                  setShowForm(true);
                }}
                className="text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(c)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryForm
          category={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    setSaving(true);

    let saveError = null;
    if (category) {
      const { error: e } = await supabase
        .from('categories')
        .update({ name: name.trim() })
        .eq('id', category.id);
      saveError = e;
    } else {
      const { error: e } = await supabase
        .from('categories')
        .insert({ name: name.trim() });
      saveError = e;
    }

    if (saveError) {
      setError('Could not save category. It may already exist.');
      setSaving(false);
      return;
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            {category ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="e.g. Wigs, Ponytails, Accessories"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs font-medium">{error}</p>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 rounded-xl font-bold bg-pink-600 text-white hover:bg-pink-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Save Category'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
