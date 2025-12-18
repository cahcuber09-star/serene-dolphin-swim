import React, { useState } from 'react';
import { useStudents, Student } from '@/contexts/StudentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Edit, Trash, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

// Helper function for robust CSV escaping
const escapeCsvValue = (value: any): string => {
    const str = String(value);
    // If the string contains a comma, double quote, or newline, wrap it in double quotes.
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        // Escape internal double quotes by doubling them
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

// Helper component for Add/Edit Student Form
interface StudentFormProps {
  initialData?: Student;
  onSubmit: (student: Omit<Student, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSubmit, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [nim, setNim] = useState(initialData?.nim || '');
  const [rfidUid, setRfidUid] = useState(initialData?.rfidUid || ''); // New state for RFID UID
  const [studentClass, setStudentClass] = useState(initialData?.class || 'A');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidUid) {
        alert("RFID UID harus diisi.");
        return;
    }
    onSubmit({ id: initialData?.id, name, nim, class: studentClass, rfidUid });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Nama</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="nim" className="text-right">NIM</Label>
        <Input id="nim" value={nim} onChange={(e) => setNim(e.target.value)} required className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="rfidUid" className="text-right">RFID UID</Label>
        <Input id="rfidUid" value={rfidUid} onChange={(e) => setRfidUid(e.target.value)} required className="col-span-3" placeholder="Contoh: 04:5F:42:5A:A4:6F:80" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="class" className="text-right">Kelas</Label>
        <Select value={studentClass} onValueChange={setStudentClass}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Pilih Kelas" />
          </SelectTrigger>
          <SelectContent>
            {['A', 'B', 'C', 'D'].map(c => (
              <SelectItem key={c} value={c}>Kelas {c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
        <Button type="submit">{initialData ? 'Simpan Perubahan' : 'Tambah Siswa'}</Button>
      </DialogFooter>
    </form>
  );
};


const StudentManagementPage: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.nim.includes(searchTerm) ||
                          student.rfidUid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || student.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleAddOrUpdate = (data: Omit<Student, 'id'> & { id?: string }) => {
    // Ensure rfidUid is present before proceeding (already checked in form, but good practice)
    if (!data.rfidUid) {
        showError("RFID UID harus diisi.");
        return;
    }
    
    if (data.id) {
      updateStudent(data as Student);
    } else {
      addStudent(data as Omit<Student, 'id'>);
    }
    setEditingStudent(undefined);
    setIsDialogOpen(false);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleNewStudent = () => {
    setEditingStudent(undefined);
    setIsDialogOpen(true);
  };
  
  const handleExport = () => {
    const dataToExport = filteredStudents.map((s, index) => ({
      'NO': index + 1, // Use index + 1 from filtered list for NO
      'NAMA LENGKAP': s.name,
      'NIM': s.nim,
      'RFID UID': s.rfidUid, 
      'KELAS': s.class,
    }));
    
    if (dataToExport.length === 0) {
        showError("Tidak ada data mahasiswa untuk diekspor.");
        return;
    }
    
    // Convert JSON to CSV format using robust escaping
    const header = Object.keys(dataToExport[0]).map(escapeCsvValue).join(',');
    const rows = dataToExport.map(row => 
        Object.values(row).map(escapeCsvValue).join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    
    const mockDownloadLink = document.createElement('a');
    mockDownloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    mockDownloadLink.download = 'data_mahasiswa.csv'; 
    document.body.appendChild(mockDownloadLink);
    mockDownloadLink.click();
    document.body.removeChild(mockDownloadLink);
    
    showSuccess("Data mahasiswa berhasil diunduh sebagai file Excel.");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Data Mahasiswa</h2>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Daftar Mahasiswa</CardTitle>
          <Button onClick={handleNewStudent}>
            <Plus className="h-4 w-4 mr-2" /> Tambah Siswa Baru
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari Nama, NIM, atau RFID UID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Semua Kelas</SelectItem>
                  {['A', 'B', 'C', 'D'].map(c => (
                    <SelectItem key={c} value={c}>Kelas {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export Data
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">NO</TableHead>
                  <TableHead>NAMA LENGKAP</TableHead>
                  <TableHead>NIM</TableHead>
                  <TableHead>RFID UID</TableHead> {/* New column */}
                  <TableHead>KELAS</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Tidak ada data mahasiswa yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.nim}</TableCell>
                      <TableCell className="text-xs font-mono">{student.rfidUid}</TableCell> {/* Display RFID UID */}
                      <TableCell>{student.class}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteStudent(student.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}</DialogTitle>
          </DialogHeader>
          <StudentForm
            initialData={editingStudent}
            onSubmit={handleAddOrUpdate}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagementPage;