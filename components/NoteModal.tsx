"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Note } from "@/types";
import { X, Trash2, Save } from "lucide-react";

interface NoteModalProps {
  note?: Note;
  onClose: () => void;
}

export function NoteModal({ note, onClose }: NoteModalProps) {
  const addNote = useStore((state) => state.addNote);
  const updateNote = useStore((state) => state.updateNote);
  const deleteNote = useStore((state) => state.deleteNote);

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return onClose();

    if (note) {
      await updateNote(note.id, { title, content });
    } else {
      await addNote({
        title,
        content,
      });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (note) {
      await deleteNote(note.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[60vh] max-h-[600px]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{note ? "Edit Note" : "New Note"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full p-2 bg-transparent border-none text-2xl font-bold text-gray-800 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none"
            autoFocus
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            className="w-full flex-1 bg-transparent border-none resize-none text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none leading-relaxed"
          />
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          {note ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-sm font-medium transition"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          ) : (
            <div /> // Spacer
          )}
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
