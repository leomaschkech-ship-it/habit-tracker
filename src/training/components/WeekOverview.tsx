import { WEEK_PLAN } from '../plan';
import type { Weekday } from '../types';
import { DaySummary } from './DaySummary';

const DAY_LABELS: Record<Weekday, string> = {
  Mo: 'Montag',
  Di: 'Dienstag',
  Mi: 'Mittwoch',
  Do: 'Donnerstag',
  Fr: 'Freitag',
  Sa: 'Samstag',
  So: 'Sonntag',
};

export function WeekOverview({ week }: { week: number }) {
  return (
    <ul className="week-overview">
      {WEEK_PLAN.map((dayPlan) => (
        <li key={dayPlan.day} className="week-overview__day">
          <div className="week-overview__day-name">{DAY_LABELS[dayPlan.day]}</div>
          <DaySummary dayPlan={dayPlan} week={week} />
        </li>
      ))}
    </ul>
  );
}
