import React, { createContext, useState, useContext, ReactNode } from 'react';
import { showSuccess, showError } from '@/utils/toast';

export interface Student {
  id: string;
  name: string;
  nim: string;
  class: string;
}

const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Danillo', nim: '190101001', class: 'A' },
  { id: 's2', name: 'Nabhan', nim: '190101002', class: 'B' },
  { id: 's3', name: 'Natasya', nim: '190101003', class: 'A' },
  { id: 's4', name: 'Tryandhono', nim: '190101004', class: 'C' },
  { id: 's5', name: 'Andhika', nim: '190101005', class: 'B' },
  { id: 's6', name: 'Budi Santoso', nim: '190101006', class: 'A' },
  { id: 's7', name: 'Citra Dewi', nim: '190101007', class: 'C' },
];

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

const generateId = () => Math.random().toString(36).substring(2, 9);

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...student, id: generateId() };
    setStudents(prev => {
      const updatedStudents = [...prev, newStudent];
      return updatedStudents;
    });
    showSuccess(`Student ${student.name} added.`);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => {
      const updatedList = prev.map(s => s.id === updatedStudent.id ? updatedStudent : s);
      return updatedList;
    });
    showSuccess(`Student ${updatedStudent.name} updated.`);
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => {
      const updatedList = prev.filter(s => s.id !== id);
      return updatedList;
    });
    showSuccess('Student deleted.');
  };

  return (
    <StudentContext.Provider value={{ students, addStudent, updateStudent, deleteStudent }}>
      {children}
    </StudentContext.Provider>
  );
};