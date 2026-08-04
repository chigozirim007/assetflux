import DashboardClient from './DashboardClient';
import ProtectedRoute from '../components/ProtectedRoute';
import { CRYPTO } from '../constants/instruments';

export const metadata = {
  title: 'Terminal Dashboard - AssetFlux',
  description: 'Your personalized financial terminal overview.',
};

// Make this page dynamic so we fetch fresh prices on every request
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardClient />
    </ProtectedRoute>
  );
}
