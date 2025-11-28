import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import MqttDataList from '@/components/MqttDataList';
import { MadeWithDyad } from '@/components/made-with-dyad';

const DashboardPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">MQTT Dashboard</h1>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Automatic List */}
        <MqttDataList
          title="Automatic List Data"
          topic="1/0"
        />

        {/* Manual List */}
        <MqttDataList
          title="Manual List Data"
          topic="1/2"
        />
      </div>
      
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default DashboardPage;