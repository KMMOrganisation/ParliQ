import React from 'react';
import { ExampleChip } from '../../types';

interface ExampleChipsProps {
  onChipClick: (query: string) => void;
  disabled?: boolean;
}

const EXAMPLE_CHIPS: ExampleChip[] = [
  { id: 'education', label: 'Education', query: 'What are the latest discussions about education policy in Parliament?' },
  { id: 'nhs', label: 'NHS/Healthcare', query: 'What has been said about NHS and healthcare in recent parliamentary debates?' },
  { id: 'homelessness', label: 'Homelessness', query: 'What are MPs saying about homelessness and housing policy?' },
  { id: 'world-politics', label: 'World Politics', query: 'What are the recent parliamentary discussions about international relations?' }
];

export function ExampleChips({ onChipClick, disabled = false }: ExampleChipsProps) {
  return (
    <div className="w-full">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip.id}
            onClick={() => onChipClick(chip.query)}
            disabled={disabled}
            className="flex-shrink-0 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-300 disabled:text-slate-500 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] flex items-center"
            aria-label={`Ask about ${chip.label}`}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}