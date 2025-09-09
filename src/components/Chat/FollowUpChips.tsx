import React from 'react';
import { FollowUpChip } from '../../types';

interface FollowUpChipsProps {
  suggestions: FollowUpChip[];
  onChipClick: (query: string) => void;
  disabled?: boolean;
}

export function FollowUpChips({ suggestions, onChipClick, disabled = false }: FollowUpChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-700">
      <p className="text-xs text-slate-400 mb-3">Continue exploring:</p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
        {suggestions.map((chip) => (
          <button
            key={chip.id}
            onClick={() => onChipClick(chip.query)}
            disabled={disabled}
            className="flex-shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-slate-400 disabled:text-slate-600 rounded-full text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[36px] flex items-center border border-slate-600"
            aria-label={`Follow up: ${chip.label}`}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}