import React, { createContext, useState, useContext, ReactNode } from 'react';
import { showSuccess, showError } from '@/utils/toast';

export interface Student {
  id: string;
  name: string;
  nim: string;
  class: string;
  rfidUid: string; // New field for RFID identification
}

const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper functions for initial data generation
const generateNIM = (index: number) => `4.32.23.${String(index + 1).padStart(3, '0')}`;
const getRandomClass = (index: number) => {
    const classes = ['A', 'B', 'C', 'D'];
    // Use modulo for deterministic class assignment based on index
    return classes[index % classes.length];
};

const RAW_STUDENTS_DATA = [
    { rfidUid: "04:3E:28:62:F4:6A:80", name: "Ryan" },
    { rfidUid: "04:5A:24:BA:04:6F:80", name: "Andhika" },
    { rfidUid: "04:5F:42:5A:A4:6F:80", name: "Nabhan" },
    { rfidUid: "04:29:6F:5A:94:6C:80", name: "Dilo" },
    { rfidUid: "05:84:6B:66:E3:E1:00", name: "Natasya" }
];

const INITIAL_STUDENTS: Student[] = RAW_STUDENTS_DATA.map((raw, index) => ({
    id: generateId(),
    name: raw.name,
    nim: generateNIM(index),
    class: getRandomClass(index),
    rfidUid: raw.rfidUid,
}));


interface StudentContextType {
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};

interface StudentProviderProps {
  children: ReactNode;
}

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const storedStudents = localStorage.getItem('studentList');
      if (storedStudents) {
        // If data exists in localStorage, load it
        return JSON.parse(storedStudents);
      }
      // If no stored data, use the initial predefined list and save it
      localStorage.setItem('studentList', JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    } catch (e) {
      console.error("Could not load student list from localStorage", e);
      return INITIAL_STUDENTS;
    }
  });

  // Function to persist changes
  const persistStudents = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    localStorage.setItem('studentList', JSON.stringify(updatedStudents));
  };

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...student, id: generateId() };
    persistStudents([...students, newStudent]);
    showSuccess(`Student ${student.name} added.`);
  };

  const updateStudent = (updatedStudent: Student) => {
    const updatedList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    persistStudents(updatedList);
    showSuccess(`Student ${updatedStudent.name} updated.`);
  };

  const deleteStudent = (id: string) => {
    const updatedList = students.filter(s => s.id !== id);
    persistStudents(updatedList);
    showSuccess('Student deleted.');
  };

  return (
    <StudentContext.Provider value={{ students, addStudent, updateStudent, deleteStudent }}>
      {children}
    </StudentContext.Provider>
  );
};