import { useEffect, useState } from 'react';
import { BottomNav, type Tab } from './components/BottomNav';
import { CalendarView } from './components/CalendarView';
import { ManageView } from './components/ManageView';
import { TodayView } from './components/TodayView';
import { useHabitStore } from './hooks/useHabitStore';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const store = useHabitStore();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const refresh = () => forceUpdate((n) => n + 1);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return (
    <div className="app">
      <main className="app__content">
        {activeTab === 'today' && <TodayView store={store} />}
        {activeTab === 'calendar' && <CalendarView store={store} />}
        {activeTab === 'manage' && <ManageView store={store} />}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
