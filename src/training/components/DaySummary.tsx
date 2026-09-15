import { useState } from 'react';
import { resolveDayPlan } from '../resolveDayPlan';
import type { DayPlan, EquipmentTag } from '../types';
import { equipmentLabel } from './equipmentLabel';

interface DaySummaryItemProps {
  name: string;
  detail: string;
  equipment?: EquipmentTag;
}

function DaySummaryItem({ name, detail, equipment }: DaySummaryItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="day-summary__item" onClick={() => setExpanded((current) => !current)}>
      <span className="day-summary__item-name">
        {name}
        {equipment && <span className="training-card__equipment-tag">{equipmentLabel(equipment)}</span>}
      </span>
      {expanded && <span className="day-summary__item-detail">{detail}</span>}
      <span className="training-card__chevron">{expanded ? '▲' : '▼'}</span>
    </li>
  );
}

export function DaySummary({ dayPlan, week }: { dayPlan: DayPlan; week: number }) {
  const resolvedExercises = resolveDayPlan(dayPlan, week, undefined, []);
  const hasContent = (dayPlan.runs?.length ?? 0) > 0 || resolvedExercises.length > 0;

  if (!hasContent) {
    return <p className="day-summary__rest">☀️ Ruhetag</p>;
  }

  return (
    <ul className="day-summary__items">
      {dayPlan.runs?.map((run) => (
        <DaySummaryItem
          key={run.id}
          name={run.name}
          detail={`${run.detailByWeek(week)} · ${run.hrZone.min}–${run.hrZone.max} bpm`}
        />
      ))}
      {resolvedExercises.map((exercise) => (
        <DaySummaryItem
          key={exercise.id}
          name={exercise.name}
          detail={`${exercise.setsReps} · ${exercise.restSec} sec Pause`}
          equipment={exercise.equipment}
        />
      ))}
    </ul>
  );
}
