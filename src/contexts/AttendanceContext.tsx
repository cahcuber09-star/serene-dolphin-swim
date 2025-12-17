import React, { createContext, useState, useContext, ReactNode } from 'react';
import { showSuccess } from '@/utils/toast';

export interface FinalAttendanceEntry {
  name: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Hadir Manual' | 'Sakit' | 'Izin' | 'Alpha';
  date: string;
  time: string;
  note?: string; // Added optional note field
}

export interface FinalAttendanceRecord {
  id: string;
  timestamp: number;
  mode: 'Automatic' | 'Manual';
  entries: FinalAttendanceEntry[];
}

interface AttendanceContextType {
  history: FinalAttendanceRecord[];
  addRecord: (mode: 'Automatic' | 'Manual', entries: FinalAttendanceEntry[]) => void;
  clearHistory: () => void; // Added clearHistory
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export const AttendanceProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Load history from localStorage or start empty
  const [history, setHistory] = useState<FinalAttendanceRecord[]>(() => {
    try {
      const storedHistory = localStorage.getItem('attendanceHistory');
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (e) {
      console.error("Could not load attendance history from localStorage", e);
      return [];
    }
  });

  const addRecord = (mode: 'Automatic' | 'Manual', entries: FinalAttendanceEntry[]) => {
    const newRecord: FinalAttendanceRecord = {
      id: generateId(),
      timestamp: Date.now(),
      mode,
      entries,
    };

    setHistory(prevHistory => {
      const updatedHistory = [newRecord, ...prevHistory];
      // Persist to localStorage
      localStorage.setItem('attendanceHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
    
    showSuccess(`Attendance recorded successfully in ${mode} mode!`);
  };
  
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('attendanceHistory');
    showSuccess('Attendance history cleared.');
  };

  return (
    <AttendanceContext.Provider value={{ history, addRecord, clearHistory }}>
      {children}
    </AttendanceContext.Provider>
  );
};