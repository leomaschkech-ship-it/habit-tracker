// habit-tracker/src/training/components/CycleCard.tsx
import { useState } from 'react';
import type { CyclePrescription } from '../types';
import { trainingIcon } from './trainingIcon';

interface CycleCardProps {
  cycle: CyclePrescription;
  week: number;
  done: boolean;
  onToggleDone: (nextDone: boolean) => void;
}

export function CycleCard({ cycle, week, done, onToggleDone }: CycleCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="habit-card training-card training-card--tappable" onClick={() => setExpanded((current) => !current)}>
      <div className="habit-card__icon">{trainingIcon('bike')}</div>
      <div className="habit-card__info">
        <div className="habit-card__name">{cycle.name}</div>
        {expanded && (
          <div className="habit-card__sub">
            {cycle.detailByWeek(week)} · {cycle.hrZone.min}–{cycle.hrZone.max} bpm
            {cycle.warmup && ` · Warm-up: ${cycle.warmup}`}
            {cycle.coolDown && ` · Cool-down: ${cycle.coolDown}`}
          </div>
        )}
      </div>
      {expanded && (
        <div className="habit-card__actions" onClick={(event) => event.stopPropagation()}>
          <label>
            Erledigt
            <input type="checkbox" checked={done} onChange={(event) => onToggleDone(event.target.checked)} />
          </label>
        </div>
      )}
      <span className="training-card__chevron">{expanded ? '▲' : '▼'}</span>
    </li>
  );
}
