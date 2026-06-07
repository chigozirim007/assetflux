import DashboardClient from './DashboardClient';
import ProtectedRoute from '../components/ProtectedRoute';

export const metadata = {
  title: 'Terminal Dashboard - AssetFlux',
  description: 'Your personalized financial terminal overview.',
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardClient />
    </ProtectedRoute>
  );
}
