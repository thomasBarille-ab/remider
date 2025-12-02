"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Plus, StickyNote } from "lucide-react";
import { NoteModal } from "./NoteModal";
import { Note } from "@/types";
import { format } from "date-fns";

export function NotesView() {
  const notes = useStore((state) => state.notes) || [];
  const searchQuery = useStore((state) => state.searchQuery);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  // Sort by updatedAt descending
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleOpenNote = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
        
        {/* Note Cards */}
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => handleOpenNote(note)}
            className="group relative flex flex-col min-h-[200px] p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
          >
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-1">
              {note.title || "Untitled Note"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-5 flex-1 whitespace-pre-wrap">
              {note.content || "No content"}
            </p>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
              <span>{format(new Date(note.updatedAt), "MMM d, yyyy")}</span>
              <StickyNote className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}

        {sortedNotes.length === 0 && searchQuery && (
           <div className="col-span-full py-12 text-center text-gray-400">
             No notes found matching "{searchQuery}"
           </div>
        )}
      </div>

      {isModalOpen && (
        <NoteModal
          note={selectedNote || undefined}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
