"use client";

import { X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  isRoutine: boolean;
  onClose: () => void;
  onConfirmSingle: () => void;
  onConfirmRoutine: () => void;
}

export function DeleteConfirmationModal({ 
  isOpen, 
  isRoutine, 
  onClose, 
  onConfirmSingle, 
  onConfirmRoutine 
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Delete Task?</h3>
        
        {isRoutine ? (
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            This task is part of a repeating routine. Do you want to delete only this occurrence or the entire series?
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
        )}

        <div className="flex flex-col gap-2 pt-2">
          {isRoutine && (
            <button
              onClick={onConfirmRoutine}
              className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg font-medium transition"
            >
              Delete Entire Routine
            </button>
          )}
          
          <button
            onClick={onConfirmSingle}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg font-medium transition"
          >
            {isRoutine ? "Delete This Occurrence Only" : "Delete Task"}
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
