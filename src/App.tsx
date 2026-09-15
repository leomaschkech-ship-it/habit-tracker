import { useEffect, useState } from 'react';
import { BottomNav, type Tab } from './components/BottomNav';
import { CalendarView } from './components/CalendarView';
import { ManageView } from './components/ManageView';
import { TodayView } from './components/TodayView';
import { TrainingView } from './training/components/TrainingView';
import { useHabitStore } from './hooks/useHabitStore';
import { useTrainingStore } from './hooks/useTrainingStore';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const store = useHabitStore();
  const trainingStore = useTrainingStore();
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
        {activeTab === 'training' && <TrainingView store={trainingStore} />}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
