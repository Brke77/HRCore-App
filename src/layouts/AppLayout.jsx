import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import FloatingActionButton from '../components/FloatingActionButton';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </main>
      <FloatingActionButton />
    </div>
  );
}
