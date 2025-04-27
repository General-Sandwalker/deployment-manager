'use client';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Settings</h1>
      
      <div className="border border-[var(--cosmic-accent)] bg-[var(--cosmic-blue)] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">System Configuration</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          System settings will be available in a future update. This area will allow administrators to configure system-wide settings.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-[var(--cosmic-light)] rounded-lg">
            <h3 className="font-medium mb-2">Coming Soon</h3>
            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1">
              <li>Email notification settings</li>
              <li>Registration and invitation policies</li>
              <li>Website deployment configurations</li>
              <li>System maintenance options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}