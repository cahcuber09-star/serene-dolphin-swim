import React, { useState } from 'react';
import { useMqtt } from '@/hooks/useMqtt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const STUDENTS = [
  { id: 1, name: 'Danillo' },
  { id: 2, name: 'Nabhan' },
  { id: 3, name: 'Natasya' },
  { id: 4, name: 'Tryandhono' },
  { id: 5, name: 'Andhika' },
];

const ManualAttendanceForm: React.FC = () => {
  const topic = "1/2";
  // We use useMqtt here primarily for connection status and publishing
  const { isConnected, publish } = useMqtt(topic); 
  const [checkedStudents, setCheckedStudents] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckChange = (id: number, checked: boolean) => {
    setCheckedStudents(prev => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSubmit = () => {
    if (!isConnected) {
      alert("MQTT client is not connected. Please wait.");
      return;
    }

    setIsSubmitting(true);
    const now = new Date();
    const timestamp = now.toISOString();
    
    const attendanceRecords = STUDENTS.map(student => ({
      name: student.name,
      status: checkedStudents[student.id] ? 'Hadir Manual' : 'Tidak Hadir',
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    }));

    // Publish all records as a single JSON array
    const payload = JSON.stringify(attendanceRecords);
    
    publish(topic, payload);
    
    showSuccess(`Manual attendance data published to topic ${topic}.`);
    
    // Reset form state after submission
    setCheckedStudents({});
    setIsSubmitting(false);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Manual Attendance Input (Topic: {topic})</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
          {!isConnected && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-4">
        <p className="text-sm text-muted-foreground mb-4">
          Checklist mahasiswa yang hadir secara manual. Data akan dikirim ke topik {topic}.
        </p>
        
        <div className="space-y-3 mb-6">
          {STUDENTS.map((student) => (
            <div key={student.id} className="flex items-center space-x-3 p-2 border rounded-md">
              <Checkbox
                id={`student-${student.id}`}
                checked={!!checkedStudents[student.id]}
                onCheckedChange={(checked) => handleCheckChange(student.id, checked === true)}
              />
              <label
                htmlFor={`student-${student.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {student.name}
              </label>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={!isConnected || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Record Attendance
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ManualAttendanceForm;