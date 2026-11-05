import React from 'react';
import { CHARACTERS, FighterCharacter } from '../types/rank';
import { X, Check } from 'lucide-react';
import { sound } from '../lib/audio';

interface FighterSelectModalProps {
  selectedCharacterId: string;
  onSelectCharacter: (char: FighterCharacter) => void;
  onClose: () => void;
}

export const FighterSelectModal: React.FC<FighterSelectModalProps> = ({
  selectedCharacterId,
  onSelectCharacter,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Choose Your Main Fighter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pick your signature tournament warrior. Your fighter card is displayed across the global ladder and arena duels.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
          {CHARACTERS.map((char) => {
            const isSelected = char.id === selectedCharacterId;
            return (
              <div
                key={char.id}
                onClick={() => {
                  sound.playClick();
                  onSelectCharacter(char);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                  {char.avatarEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                      {char.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {char.title}
                  </div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
                    {char.specialMove}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
