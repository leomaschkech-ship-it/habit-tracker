import { type FormEvent, useState } from 'react';
import { todayISO } from '../../dateUtils';
import type { BaselineTest } from '../types';

interface BaselineFormProps {
  history: BaselineTest[];
  onSubmit: (test: BaselineTest) => void;
  onClose: () => void;
}

function toOptionalNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function combineMinSec(minutes: string, seconds: string): number | undefined {
  if (minutes.trim() === '' && seconds.trim() === '') return undefined;
  const min = minutes.trim() === '' ? 0 : Number(minutes);
  const sec = seconds.trim() === '' ? 0 : Number(seconds);
  if (!Number.isFinite(min) || !Number.isFinite(sec)) return undefined;
  return min * 60 + sec;
}

function formatPace(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')} min/km`;
}

const HISTORY_FIELDS: Array<{
  key: keyof BaselineTest;
  label: string;
  format: (value: number) => string;
}> = [
  { key: 'pullups', label: 'Klimmzüge', format: (v) => `${v}` },
  { key: 'pushups', label: 'Liegestütze', format: (v) => `${v}` },
  { key: 'dips', label: 'Dips', format: (v) => `${v}` },
  { key: 'kbShoulderPressRepsRight', label: 'KB-Schulterdrücken rechts', format: (v) => `${v}` },
  { key: 'kbShoulderPressRepsLeft', label: 'KB-Schulterdrücken links', format: (v) => `${v}` },
  { key: 'easyPaceSecPerKm', label: 'Easy-Pace', format: formatPace },
  { key: 'tempoPaceSecPerKm', label: 'Tempo-Pace', format: formatPace },
];

interface PaceInputProps {
  label: string;
  minutes: string;
  seconds: string;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
}

function PaceInput({ label, minutes, seconds, onMinutesChange, onSecondsChange }: PaceInputProps) {
  return (
    <label className="baseline-form__pace-label">
      {label} (min:sek pro km)
      <span className="baseline-form__pace-inputs">
        <input
          type="number"
          min={0}
          placeholder="Min"
          aria-label={`${label} Minuten`}
          value={minutes}
          onChange={(event) => onMinutesChange(event.target.value)}
        />
        <span>:</span>
        <input
          type="number"
          min={0}
          max={59}
          placeholder="Sek"
          aria-label={`${label} Sekunden`}
          value={seconds}
          onChange={(event) => onSecondsChange(event.target.value)}
        />
      </span>
    </label>
  );
}

export function BaselineForm({ history, onSubmit, onClose }: BaselineFormProps) {
  const [pullups, setPullups] = useState('');
  const [pushups, setPushups] = useState('');
  const [dips, setDips] = useState('');
  const [kbPressRight, setKbPressRight] = useState('');
  const [kbPressLeft, setKbPressLeft] = useState('');
  const [easyPaceMin, setEasyPaceMin] = useState('');
  const [easyPaceSec, setEasyPaceSec] = useState('');
  const [tempoPaceMin, setTempoPaceMin] = useState('');
  const [tempoPaceSec, setTempoPaceSec] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({
      date: todayISO(),
      pullups: toOptionalNumber(pullups),
      pushups: toOptionalNumber(pushups),
      dips: toOptionalNumber(dips),
      kbShoulderPressRepsRight: toOptionalNumber(kbPressRight),
      kbShoulderPressRepsLeft: toOptionalNumber(kbPressLeft),
      easyPaceSecPerKm: combineMinSec(easyPaceMin, easyPaceSec),
      tempoPaceSecPerKm: combineMinSec(tempoPaceMin, tempoPaceSec),
    });
    onClose();
  }

  const sortedHistory = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="baseline-form">
      <h2>Baseline-Test</h2>
      <form onSubmit={handleSubmit}>
        <div className="baseline-form__section-title">Kraft</div>
        <div className="baseline-form__grid">
          <label>
            Klimmzüge (max. Reps)
            <input type="number" min={0} value={pullups} onChange={(event) => setPullups(event.target.value)} />
          </label>
          <label>
            Liegestütze (max. Reps)
            <input type="number" min={0} value={pushups} onChange={(event) => setPushups(event.target.value)} />
          </label>
          <label>
            Dips (max. Reps)
            <input type="number" min={0} value={dips} onChange={(event) => setDips(event.target.value)} />
          </label>
          <label>
            KB-Schulterdrücken rechts (max. Reps)
            <input
              type="number"
              min={0}
              value={kbPressRight}
              onChange={(event) => setKbPressRight(event.target.value)}
            />
          </label>
          <label>
            KB-Schulterdrücken links (max. Reps)
            <input
              type="number"
              min={0}
              value={kbPressLeft}
              onChange={(event) => setKbPressLeft(event.target.value)}
            />
          </label>
        </div>

        <div className="baseline-form__section-title">Ausdauer</div>
        <div className="baseline-form__grid">
          <PaceInput
            label="Easy-Pace"
            minutes={easyPaceMin}
            seconds={easyPaceSec}
            onMinutesChange={setEasyPaceMin}
            onSecondsChange={setEasyPaceSec}
          />
          <PaceInput
            label="Tempo-Pace"
            minutes={tempoPaceMin}
            seconds={tempoPaceSec}
            onMinutesChange={setTempoPaceMin}
            onSecondsChange={setTempoPaceSec}
          />
        </div>

        <div className="baseline-form__actions">
          <button type="submit">Speichern</button>
          <button type="button" onClick={onClose}>
            Schließen
          </button>
        </div>
      </form>

      {sortedHistory.length > 0 && (
        <div className="baseline-form__history">
          <div className="baseline-form__section-title">Verlauf</div>
          <ul className="baseline-form__history-list">
            {sortedHistory.map((test, index) => {
              const filledFields = HISTORY_FIELDS.filter(({ key }) => typeof test[key] === 'number');
              return (
                <li key={`${test.date}-${index}`} className="baseline-form__history-entry">
                  <div className="baseline-form__history-date">{test.date}</div>
                  {filledFields.length > 0 ? (
                    <div className="baseline-form__history-values">
                      {filledFields.map(({ key, label, format }) => (
                        <span key={key}>
                          {label}: {format(test[key] as number)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="baseline-form__history-values baseline-form__history-values--empty">
                      Keine Werte eingetragen
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
