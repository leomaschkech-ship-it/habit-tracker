import { useState } from 'react';
import { getSuggestion, type Suggestion } from '../suggestions';
import type { ResolvedExercise } from '../resolveDayPlan';
import type { ExerciseOverride, ExerciseRating } from '../types';
import { equipmentLabel } from './equipmentLabel';
import { trainingIcon } from './trainingIcon';

const DIFFICULTY_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'sehr leicht',
  2: 'leicht',
  3: 'passend',
  4: 'schwer',
  5: 'sehr schwer',
};

interface ExerciseCardProps {
  exercise: ResolvedExercise;
  ratings: ExerciseRating[];
  override: ExerciseOverride | undefined;
  onRate: (difficulty: 1 | 2 | 3 | 4 | 5) => void;
  onAcceptSuggestion: (suggestion: Suggestion) => void;
}

export function ExerciseCard({ exercise, ratings, override, onRate, onAcceptSuggestion }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissedDelta, setDismissedDelta] = useState<number | null>(null);
  const suggestion = getSuggestion(ratings, exercise.id);
  const alreadyApplied = override !== undefined && suggestion !== null && override.repsDelta === suggestion.repsDelta;
  const showSuggestion = suggestion !== null && !alreadyApplied && dismissedDelta !== suggestion.repsDelta;

  return (
    <li className="habit-card training-card training-card--tappable" onClick={() => setExpanded((current) => !current)}>
      <div className="habit-card__icon">{trainingIcon('exercise')}</div>
      <div className="habit-card__info">
        <div className="habit-card__name">
          {exercise.name}
          {exercise.equipment && (
            <span className="training-card__equipment-tag">{equipmentLabel(exercise.equipment)}</span>
          )}
        </div>
        {expanded && (
          <>
            <div className="habit-card__sub">
              {exercise.setsReps} · {exercise.restSec} sec Pause
              {exercise.substituted && ' · Ersatzübung'}
              {exercise.adjustmentApplied && <span className="training-card__adjusted-tag">angepasst</span>}
            </div>
            {override && !exercise.adjustmentApplied && (
              <div className="training-card__override">{override.note}</div>
            )}
            {showSuggestion && suggestion && (
              <div className="training-card__suggestion">
                <span>{suggestion.text}</span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onAcceptSuggestion(suggestion);
                  }}
                >
                  Ja
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setDismissedDelta(suggestion.repsDelta);
                  }}
                >
                  Nein
                </button>
              </div>
            )}
            <div className="training-card__rating">
              {([1, 2, 3, 4, 5] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Schwierigkeit ${value}: ${DIFFICULTY_LABELS[value]}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRate(value);
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="training-card__rating-caption">sehr leicht · passend · sehr schwer</div>
          </>
        )}
      </div>
      <span className="training-card__chevron">{expanded ? '▲' : '▼'}</span>
    </li>
  );
}
