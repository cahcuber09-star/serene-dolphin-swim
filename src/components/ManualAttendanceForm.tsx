import React, { useState, useEffect } from 'react';
import { useMqtt } from '@/hooks/useMqtt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { FinalAttendanceEntry } from '@/contexts/AttendanceContext';

const STUDENTS = [
  { id: 1, name: 'Danillo' },
  { id: 2, name: 'Nabhan' },
  { id: 3, name: 'Natasya' },
  { id: 4, name: 'Tryandhono' },
  { id: 5, name: 'Andhika' },
];

interface ManualAttendanceFormProps {
  onRecordsChange: (records: FinalAttendanceEntry[]) => void;
}

const ManualAttendanceForm: React.FC<ManualAttendanceFormProps> = ({ onRecordsChange }) => {
  const topic = "1/2";
  const { isConnected } = useMqtt(topic); 
  const [checkedStudents, setCheckedStudents] = useState<Record<number, boolean>>({});

  const handleCheckChange = (id: number, checked: boolean) => {
    setCheckedStudents(prev => ({
      ...prev,
      [id]: checked,
    }));
  };
  
  // Calculate records whenever checklist changes
  useEffect(() => {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    const attendanceRecords: FinalAttendanceEntry[] = STUDENTS.map(student => ({
      name: student.name,
      status: checkedStudents[student.id] ? 'Hadir Manual' : 'Tidak Hadir',
      date: date,
      time: time,
    }));
    
    onRecordsChange(attendanceRecords);
  }, [checkedStudents, onRecordsChange]);


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
          Checklist mahasiswa yang hadir secara manual. Data akan disiapkan untuk direkam.
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
        
        {/* Removed internal submit button, relying on parent component */}
      </CardContent>
    </Card>
  );
};

export default ManualAttendanceForm;