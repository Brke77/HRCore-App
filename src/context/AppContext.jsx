import { createContext, useContext, useState } from 'react';
import { EMPLOYEES, LEAVE_REQUESTS } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState(LEAVE_REQUESTS);
  const [selectedEmployee, setSelectedEmployee] = useState(EMPLOYEES[4]); // Can Berk as default

  const approveRequest = (id) => {
    setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const rejectRequest = (id) => {
    setLeaveRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const addLeaveRequest = (request) => {
    setLeaveRequests((prev) => [...prev, { ...request, id: 'lr' + Date.now() }]);
  };

  const addEmployee = (newEmployee) => {
    setEmployees((prev) => [
      {
        ...newEmployee,
        id: prev.length > 0 ? Math.max(...prev.map((e) => e.id)) + 1 : 1,
        status: 'Aktif',
        remainingLeave: 20,
        totalLeave: 20,
        daysWorked: 0,
        recentActivity: [{ desc: 'Sisteme kayıt edildi', date: 'Bugün' }],
      },
      ...prev,
    ]);
  };

  const cancelLeave = (employeeId, leaveId) => {
    setLeaveRequests((prev) => {
      const targetLeave = prev.find((r) => r.id === leaveId);
      if (!targetLeave) return prev;
      
      let refundDays = parseInt(targetLeave.duration);
      if (isNaN(refundDays)) {
         const diff = new Date(targetLeave.endDate) - new Date(targetLeave.startDate);
         refundDays = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
      }

      setEmployees((emps) => emps.map((emp) => {
        if (emp.id === employeeId) {
          return { ...emp, remainingLeave: emp.remainingLeave + refundDays };
        }
        return emp;
      }));

      return prev.filter((r) => r.id !== leaveId);
    });
  };

  return (
    <AppContext.Provider value={{
      employees,
      leaveRequests,
      selectedEmployee,
      setSelectedEmployee,
      approveRequest,
      rejectRequest,
      addLeaveRequest,
      cancelLeave,
      addEmployee,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
