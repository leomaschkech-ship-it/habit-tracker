import { useState } from 'react';
import type { RunPrescription } from '../types';
import { trainingIcon } from './trainingIcon';

interface RunCardProps {
  run: RunPrescription;
  week: number;
  done: boolean;
  onToggleDone: (nextDone: boolean) => void;
}

export function RunCard({ run, week, done, onToggleDone }: RunCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="habit-card training-card training-card--tappable" onClick={() => setExpanded((current) => !current)}>
      <div className="habit-card__icon">{trainingIcon('run')}</div>
      <div className="habit-card__info">
        <div className="habit-card__name">{run.name}</div>
        {expanded && (
          <div className="habit-card__sub">
            {run.detailByWeek(week)} · {run.hrZone.min}–{run.hrZone.max} bpm
            {run.warmup && ` · Warm-up: ${run.warmup}`}
            {run.coolDown && ` · Cool-down: ${run.coolDown}`}
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
