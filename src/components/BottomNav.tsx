export type Tab = 'today' | 'calendar' | 'manage' | 'training';

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Heute' },
  { id: 'calendar', label: 'Kalender' },
  { id: 'manage', label: 'Verwalten' },
  { id: 'training', label: 'Training' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={
            tab.id === active ? 'bottom-nav__item bottom-nav__item--active' : 'bottom-nav__item'
          }
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
