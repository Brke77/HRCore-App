import { createContext, useContext, useState } from 'react';
import { EMPLOYEES, LEAVE_REQUESTS } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const INITIAL_SAFETY = {
    incidents: [
      { id: 'inc_1', department: 'Üretim', type: 'Düşme', level: 'Düşük Risk', date: '2026-03-01' }
    ],
    ppeAudits: [
      { id: 'ppe_1', department: 'Üretim', compliantRate: 64, date: '2026-04-05' },
      { id: 'ppe_2', department: 'Lojistik', compliantRate: 85, date: '2026-04-06' }
    ],
    riskAssessments: [
      { id: 'risk_1', department: 'Üretim', area: 'Montaj Hattı A', score: 80, level: 'Yüksek Riskli' },
      { id: 'risk_2', department: 'Lojistik', area: 'Kimyasal Depo', score: 65, level: 'Orta Riskli' }
    ]
  };

  const [employees, setEmployees] = useState(EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState(LEAVE_REQUESTS);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [safetyData, setSafetyData] = useState(INITIAL_SAFETY);

  const addIncident = (incident) => {
    setSafetyData(prev => ({ ...prev, incidents: [incident, ...prev.incidents] }));
  };
  
  const addPPEAudit = (audit) => {
    setSafetyData(prev => ({ ...prev, ppeAudits: [audit, ...prev.ppeAudits.filter(a => a.department !== audit.department)] }));
  };

  const updateRiskAssessment = (assessmentId, newData) => {
    setSafetyData(prev => ({
       ...prev, riskAssessments: prev.riskAssessments.map(r => r.id === assessmentId ? { ...r, ...newData } : r)
    }));
  };

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
        comments: [],
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

  const deleteEmployee = (employeeId) => {
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    if (selectedEmployee?.id === employeeId) {
      setSelectedEmployee(null);
    }
  };

  const makeManager = (employeeId) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId ? { ...emp, title: 'Department Manager', isManager: true } : emp
      )
    );
    if (selectedEmployee?.id === employeeId) {
      setSelectedEmployee((prev) => ({ ...prev, title: 'Department Manager', isManager: true }));
    }
  };

  // Çalışana yönetici yorumu ekle
  const addComment = (employeeId, comment) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          const newComment = {
            id: 'cmt_' + Date.now(),
            ...comment,
            date: new Date().toLocaleString('tr-TR', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            }),
          };
          return { ...emp, comments: [newComment, ...(emp.comments || [])] };
        }
        return emp;
      })
    );

    // selectedEmployee'yi de güncelle
    setSelectedEmployee((prev) => {
      if (!prev || prev.id !== employeeId) return prev;
      const newComment = {
        id: 'cmt_' + Date.now() + 1,
        ...comment,
        date: new Date().toLocaleString('tr-TR', {
          day: '2-digit', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
      };
      return { ...prev, comments: [newComment, ...(prev.comments || [])] };
    });
  };

  // Performans puanı ekleme (Onay/Aferin mekanizması için)
  const updateEmployeePerformance = (employeeName, points) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.name === employeeName) {
          const newScore = (emp.performanceScore || 85) + points; // Varsayılan 85 üzerinden başlar
          return { ...emp, performanceScore: newScore > 100 ? 100 : newScore }; // 100 ile sınırla
        }
        return emp;
      })
    );

    setSelectedEmployee((prev) => {
      if (!prev || prev.name !== employeeName) return prev;
      const newScore = (prev.performanceScore || 85) + points;
      return { ...prev, performanceScore: newScore > 100 ? 100 : newScore };
    });
  };

  const addEmployeeActivity = (employeeName, desc, date = 'Şimdi', extraParams = {}) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.name === employeeName) {
          const newActivities = [{ id: 'ea' + Date.now().toString(), desc, date, ...extraParams }, ...(emp.recentActivity || [])];
          return { ...emp, recentActivity: newActivities };
        }
        return emp;
      })
    );

    setSelectedEmployee((prev) => {
      if (!prev || prev.name !== employeeName) return prev;
      const newActivities = [{ id: 'ea' + Date.now().toString(), desc, date, ...extraParams }, ...(prev.recentActivity || [])];
      return { ...prev, recentActivity: newActivities };
    });
  };

  const approveEmployeeActivity = (employeeName, activityId) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.name === employeeName && emp.recentActivity) {
          const updatedActivities = emp.recentActivity.map(act => 
            act.id === activityId ? { ...act, isApproved: true } : act
          );
          return { ...emp, recentActivity: updatedActivities };
        }
        return emp;
      })
    );
    setSelectedEmployee((prev) => {
      if (!prev || prev.name !== employeeName || !prev.recentActivity) return prev;
      const updatedActivities = prev.recentActivity.map(act => 
        act.id === activityId ? { ...act, isApproved: true } : act
      );
      return { ...prev, recentActivity: updatedActivities };
    });
  };

  // selectedEmployee'yi employees state'iyle senkronize et
  const syncSelectedEmployee = (employeeId) => {
    setEmployees((prev) => {
      const found = prev.find((e) => e.id === employeeId);
      if (found) setSelectedEmployee(found);
      return prev;
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
      deleteEmployee,
      makeManager,
      addComment,
      updateEmployeePerformance,
      addEmployeeActivity,
      approveEmployeeActivity,
      syncSelectedEmployee,
      safetyData,
      addIncident,
      addPPEAudit,
      updateRiskAssessment,
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
