import AgencyShell from '@/components/agency/Shell';

export default function AgencyDashboardPage() {
  return (
    <AgencyShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-orange-600">
          Agency Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome! Use the menu to manage your tour packages, bookings, and more.
        </p>
      </div>
    </AgencyShell>
  );
}