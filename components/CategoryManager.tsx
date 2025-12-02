"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Plus, X, Trash2, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryItem } from "@/types";

const AVAILABLE_COLORS = [
  { label: "Blue", value: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "Green", value: "bg-green-100 text-green-700 border-green-200" },
  { label: "Red", value: "bg-red-100 text-red-700 border-red-200" },
  { label: "Purple", value: "bg-purple-100 text-purple-700 border-purple-200" },
  { label: "Gray", value: "bg-gray-100 text-gray-700 border-gray-200" },
  { label: "Yellow", value: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { label: "Pink", value: "bg-pink-100 text-pink-700 border-pink-200" },
  { label: "Indigo", value: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { label: "Orange", value: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "Teal", value: "bg-teal-100 text-teal-700 border-teal-200" },
];

export function CategoryManager({ onClose }: { onClose: () => void }) {
  const categories = useStore((state) => state.categories);
  const addCategory = useStore((state) => state.addCategory);
  const updateCategory = useStore((state) => state.updateCategory);
  const removeCategory = useStore((state) => state.removeCategory);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0].value);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    await addCategory({
      label: newCategoryName.trim(),
      color: selectedColor,
    });
    setNewCategoryName("");
  };

  const startEditing = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditName(cat.label);
    setEditColor(cat.color);
  };

  const saveEdit = async () => {
    if (editingId && editName.trim()) {
      await updateCategory(editingId, {
        label: editName.trim(),
        color: editColor
      });
      setEditingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Manage Categories</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Add New Category */}
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Category Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Fitness"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Color</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color.label}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      color.value.split(" ")[0], // Extract bg color class
                      selectedColor === color.value ? "ring-2 ring-offset-2 ring-gray-400 border-gray-400" : "border-transparent"
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newCategoryName.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Existing Categories</h3>
            <div className="space-y-2 pr-1">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-gray-50 rounded-xl p-3">
                  {editingId === cat.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            autoFocus
                         />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_COLORS.map((color) => (
                          <button
                            key={color.label}
                            type="button"
                            onClick={() => setEditColor(color.value)}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 transition-all",
                              color.value.split(" ")[0],
                              editColor === color.value ? "ring-2 ring-offset-2 ring-gray-400 border-gray-400" : "border-transparent"
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-200 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <span className={cn("px-2 py-1 rounded-lg text-sm font-medium", cat.color)}>
                        {cat.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditing(cat)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit category"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => await removeCategory(cat.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No categories found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
