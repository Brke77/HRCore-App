import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { EMPLOYEES, LEAVE_REQUESTS } from '../data/mockData';
import { useAuth } from './AuthContext';
import { getAppState, setAppState } from '../services/api';

const AppContext = createContext(null);
const WEEK_DAYS = ['Pzt', 'Sal', 'Car', 'Per', 'Cum'];
const EMPLOYEES_STORAGE_KEY = 'hrcore.app.employees';
const LEAVE_REQUESTS_STORAGE_KEY = 'hrcore.app.leaveRequests';
const SAFETY_STORAGE_KEY = 'hrcore.app.safetyData';
const KAIZEN_STORAGE_KEY = 'hrcore.app.kaizenSuggestions';
const CAPACITY_STORAGE_KEY = 'hrcore.app.capacityProfiles';
const ACTION_PLAN_STORAGE_KEY = 'hrcore.app.actionPlans';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calculateUtilizationRate(weeklyLoad) {
  return Math.round(
    WEEK_DAYS.reduce((sum, day) => sum + Number(weeklyLoad[day] || 0), 0) / WEEK_DAYS.length
  );
}

function calculateEfficiencyScore(employee, utilizationRate) {
  return clamp(
    Math.round(
      ((employee.performanceScore || employee.performanceData?.averageScore || 82) * 0.65) +
        (100 - utilizationRate) * 0.2 +
        18
    ),
    62,
    99
  );
}

function resolveRiskLevel(score) {
  if (score <= 24) return 'Çözüldü';
  if (score >= 80) return 'Yüksek Riskli';
  if (score >= 50) return 'Orta Riskli';
  return 'Düşük Risk';
}

function generateTemporaryPassword() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const alphaNumeric = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const firstBlock = `HR-${letters[Math.floor(Math.random() * letters.length)]}${Math.floor(Math.random() * 10)}${alphaNumeric[Math.floor(Math.random() * alphaNumeric.length)]}`;
  const secondBlock = `${Math.floor(Math.random() * 10)}${alphaNumeric[Math.floor(Math.random() * alphaNumeric.length)]}`;
  return `${firstBlock}-${secondBlock}`;
}

function resolveDepartmentSeed(department) {
  const seeds = {
    Yazilim: [78, 86, 92, 95, 88],
    Pazarlama: [68, 74, 81, 76, 71],
    IK: [72, 79, 84, 73, 70],
    Finans: [88, 91, 94, 97, 89],
    Uretim: [94, 96, 98, 93, 91],
    Lojistik: [90, 92, 95, 93, 90],
    Satis: [83, 88, 91, 87, 86],
  };

  const key = (department || 'Yazilim')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z]/g, '');

  return seeds[key] || seeds.Yazilim;
}

function createCapacityProfile(employee) {
  const basePattern = resolveDepartmentSeed(employee.department);
  const offset = (employee.id % 5) - 2;
  const weeklyLoad = WEEK_DAYS.reduce((acc, day, index) => {
    acc[day] = clamp(basePattern[index] + offset * 3 + (index % 2 === 0 ? 1 : -1), 55, 99);
    return acc;
  }, {});

  const utilizationRate = calculateUtilizationRate(weeklyLoad);
  const efficiencyScore = calculateEfficiencyScore(employee, utilizationRate);

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    title: employee.title,
    efficiencyScore,
    utilizationRate,
    weeklyLoad,
  };
}

function createInitialKaizenSuggestions(employees) {
  const zeynep = employees.find((emp) => emp.name === 'Zeynep Kaya');
  const mehmet = employees.find((emp) => emp.name === 'Mehmet Akın');

  return [
    {
      id: 'kz_1',
      employeeId: zeynep?.id || 2,
      employeeName: zeynep?.name || 'Zeynep Kaya',
      department: zeynep?.department || 'Pazarlama',
      title: 'Onay akisinda tek adim kisa yol',
      text: 'Kampanya brief onayinda hazir sablon kullanilirsa revizyon turleri %15 azalir.',
      impact: 'Onay suresi -15%',
      status: 'review',
      upvotes: 6,
      upvotedBy: ['u1', 'u4'],
      createdAt: 'Bugun, 09:20',
      appliedBy: null,
      appliedAt: null,
    },
    {
      id: 'kz_2',
      employeeId: mehmet?.id || 7,
      employeeName: mehmet?.name || 'Mehmet Akin',
      department: mehmet?.department || 'Yazilim',
      title: 'API log filtreleme otomasyonu',
      text: 'Hata loglarinda 4xx ve 5xx ayrimi otomatik etiketlenirse inceleme suresi gunluk 25 dakika kisalir.',
      impact: 'Gunluk 25 dk kazanc',
      status: 'applied',
      upvotes: 11,
      upvotedBy: ['u1', 'u2', 'u4', 'u5'],
      createdAt: 'Dun, 16:45',
      appliedBy: 'Selin Yilmaz',
      appliedAt: 'Dun, 18:00',
    },
  ];
}

function createInitialActionPlans() {
  return [
    {
      id: 'ap_1',
      title: '5S etiketleme standardi guncellensin',
      owner: 'Selin Yılmaz',
      dueDate: '2026-04-15',
      status: 'Beklemede',
      sourceRiskId: 'risk_1',
      department: 'Üretim',
    },
  ];
}

function buildActionPlanFromRisk(risk, owner) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  return {
    id: 'ap_' + Date.now(),
    title: `${risk.area} icin 5S duzeltici aksiyon baslat`,
    owner,
    dueDate: dueDate.toISOString().split('T')[0],
    status: 'Beklemede',
    sourceRiskId: risk.id,
    department: risk.department,
  };
}

export function AppProvider({ children }) {
  const { registerEmployeeAccount } = useAuth();
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

  const [employees, setEmployees] = useState(() => getAppState(EMPLOYEES_STORAGE_KEY, EMPLOYEES));
  const [leaveRequests, setLeaveRequests] = useState(() => getAppState(LEAVE_REQUESTS_STORAGE_KEY, LEAVE_REQUESTS));
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [safetyData, setSafetyData] = useState(() => getAppState(SAFETY_STORAGE_KEY, INITIAL_SAFETY));
  const [capacityProfiles, setCapacityProfiles] = useState(() =>
    getAppState(CAPACITY_STORAGE_KEY, getAppState(EMPLOYEES_STORAGE_KEY, EMPLOYEES).map(createCapacityProfile))
  );
  const [kaizenSuggestions, setKaizenSuggestions] = useState(() =>
    getAppState(KAIZEN_STORAGE_KEY, createInitialKaizenSuggestions(getAppState(EMPLOYEES_STORAGE_KEY, EMPLOYEES)))
  );
  const [actionPlans, setActionPlans] = useState(() =>
    getAppState(ACTION_PLAN_STORAGE_KEY, createInitialActionPlans())
  );
  const [focusedOperationalItem, setFocusedOperationalItem] = useState(null);

  useEffect(() => {
    setAppState(EMPLOYEES_STORAGE_KEY, employees);
  }, [employees]);

  useEffect(() => {
    setAppState(LEAVE_REQUESTS_STORAGE_KEY, leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    setAppState(SAFETY_STORAGE_KEY, safetyData);
  }, [safetyData]);

  useEffect(() => {
    setAppState(CAPACITY_STORAGE_KEY, capacityProfiles);
  }, [capacityProfiles]);

  useEffect(() => {
    setAppState(KAIZEN_STORAGE_KEY, kaizenSuggestions);
  }, [kaizenSuggestions]);

  useEffect(() => {
    setAppState(ACTION_PLAN_STORAGE_KEY, actionPlans);
  }, [actionPlans]);

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

  const updateCapacityProfile = (employeeId, day, value) => {
    const normalizedValue = clamp(Number(value), 0, 100);

    setCapacityProfiles((prev) =>
      prev.map((profile) => {
        if (profile.employeeId !== employeeId) return profile;

        const nextWeeklyLoad = {
          ...profile.weeklyLoad,
          [day]: normalizedValue,
        };
        const nextUtilizationRate = calculateUtilizationRate(nextWeeklyLoad);
        const employee = employees.find((emp) => emp.id === employeeId);

        return {
          ...profile,
          weeklyLoad: nextWeeklyLoad,
          utilizationRate: nextUtilizationRate,
          efficiencyScore: calculateEfficiencyScore(employee || {}, nextUtilizationRate),
        };
      })
    );
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
    const basePassword = newEmployee.password || generateTemporaryPassword();
    let createdEmployee = null;

    setEmployees((prev) => {
      createdEmployee = {
        ...newEmployee,
        id: prev.length > 0 ? Math.max(...prev.map((e) => e.id)) + 1 : 1,
        status: 'Aktif',
        remainingLeave: 20,
        totalLeave: 20,
        daysWorked: 0,
        comments: [],
        recentActivity: [{ desc: 'Sisteme kayıt edildi', date: 'Bugün' }],
        password: basePassword,
      };

      return [createdEmployee, ...prev];
    });

    if (createdEmployee) {
      setCapacityProfiles((prev) => [createCapacityProfile(createdEmployee), ...prev]);
      registerEmployeeAccount(createdEmployee);
    }

    return createdEmployee;
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
    setCapacityProfiles((prev) => prev.filter((profile) => profile.employeeId !== employeeId));
    setKaizenSuggestions((prev) => prev.filter((suggestion) => suggestion.employeeId !== employeeId));
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

    setCapacityProfiles((prev) =>
      prev.map((profile) =>
        profile.employeeName === employeeName
          ? {
              ...profile,
              efficiencyScore: calculateEfficiencyScore(
                {
                  performanceScore: Math.min(
                    100,
                    (employees.find((emp) => emp.name === employeeName)?.performanceScore || 85) + points
                  ),
                },
                profile.utilizationRate
              ),
            }
          : profile
      )
    );
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

  const submitKaizenSuggestion = ({ employeeId, employeeName, department, title, text, impact }) => {
    setKaizenSuggestions((prev) => [
      {
        id: 'kz_' + Date.now(),
        employeeId,
        employeeName,
        department,
        title,
        text,
        impact,
        status: 'review',
        upvotes: 1,
        upvotedBy: [],
        createdAt: new Date().toLocaleString('tr-TR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        appliedBy: null,
        appliedAt: null,
      },
      ...prev,
    ]);
  };

  const toggleKaizenUpvote = (suggestionId, userId) => {
    setKaizenSuggestions((prev) =>
      prev.map((suggestion) => {
        if (suggestion.id !== suggestionId) return suggestion;

        const alreadyUpvoted = suggestion.upvotedBy.includes(userId);
        return {
          ...suggestion,
          upvotes: alreadyUpvoted ? Math.max(0, suggestion.upvotes - 1) : suggestion.upvotes + 1,
          upvotedBy: alreadyUpvoted
            ? suggestion.upvotedBy.filter((id) => id !== userId)
            : [...suggestion.upvotedBy, userId],
        };
      })
    );
  };

  const markKaizenApplied = (suggestionId, managerName) => {
    let appliedSuggestion = null;

    setKaizenSuggestions((prev) =>
      prev.map((suggestion) => {
        if (suggestion.id !== suggestionId || suggestion.status === 'applied') return suggestion;

        appliedSuggestion = {
          ...suggestion,
          status: 'applied',
          appliedBy: managerName,
          appliedAt: new Date().toLocaleString('tr-TR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        return appliedSuggestion;
      })
    );

    if (appliedSuggestion) {
      updateEmployeePerformance(appliedSuggestion.employeeName, 20);
      addEmployeeActivity(
        appliedSuggestion.employeeName,
        `Kaizen Uygulandi: ${appliedSuggestion.title}`,
        'Simdi',
        { type: 'kaizen', isApproved: true }
      );
    }

    return appliedSuggestion;
  };

  const createActionPlanFromRisk = (risk, owner) => {
    let createdPlan = null;

    setActionPlans((prev) => {
      const existingPlan = prev.find((plan) => plan.sourceRiskId === risk.id);
      if (existingPlan) {
        createdPlan = existingPlan;
        return prev;
      }

      createdPlan = buildActionPlanFromRisk(risk, owner);
      return [createdPlan, ...prev];
    });

    return createdPlan;
  };

  const updateActionPlanStatus = (planId, status) => {
    let linkedRiskId = null;
    let shouldResolveRisk = false;

    setActionPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        linkedRiskId = plan.sourceRiskId;
        shouldResolveRisk = plan.status !== 'Tamamlandı' && status === 'Tamamlandı';
        return { ...plan, status };
      })
    );

    if (shouldResolveRisk && linkedRiskId) {
      setSafetyData((prev) => ({
        ...prev,
        riskAssessments: prev.riskAssessments.map((risk) => {
          if (risk.id !== linkedRiskId) return risk;
          const nextScore = clamp((risk.score || 0) - 20, 0, 100);
          return {
            ...risk,
            score: nextScore,
            level: resolveRiskLevel(nextScore),
            status: nextScore <= 24 ? 'Çözüldü' : 'İyileştirildi',
          };
        }),
      }));
    }
  };

  const clearFocusedOperationalItem = () => setFocusedOperationalItem(null);

  const departmentCapacitySummary = useMemo(() => {
    const summaryMap = capacityProfiles.reduce((acc, profile) => {
      const hasDailyRisk = WEEK_DAYS.some((day) => Number(profile.weeklyLoad?.[day] || 0) >= 90);

      if (!acc[profile.department]) {
        acc[profile.department] = {
          department: profile.department,
          employees: 0,
          overloaded: 0,
          averageUtilization: 0,
          riskyCells: 0,
        };
      }

      acc[profile.department].employees += 1;
      acc[profile.department].averageUtilization += profile.utilizationRate;
      acc[profile.department].riskyCells += WEEK_DAYS.filter(
        (day) => Number(profile.weeklyLoad?.[day] || 0) >= 90
      ).length;
      if (hasDailyRisk) {
        acc[profile.department].overloaded += 1;
      }

      return acc;
    }, {});

    return Object.values(summaryMap).map((item) => ({
      ...item,
      averageUtilization: item.employees > 0 ? Math.round(item.averageUtilization / item.employees) : 0,
      hasBottleneck: item.overloaded > 3,
      hasLiveRisk: item.overloaded > 0,
    }));
  }, [capacityProfiles]);

  const capacityRiskDepartments = useMemo(
    () => departmentCapacitySummary.filter((item) => item.hasLiveRisk),
    [departmentCapacitySummary]
  );

  const bottleneckDepartments = useMemo(
    () => departmentCapacitySummary.filter((item) => item.hasBottleneck),
    [departmentCapacitySummary]
  );

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
      capacityProfiles,
      updateCapacityProfile,
      departmentCapacitySummary,
      capacityRiskDepartments,
      bottleneckDepartments,
      kaizenSuggestions,
      submitKaizenSuggestion,
      toggleKaizenUpvote,
      markKaizenApplied,
      actionPlans,
      createActionPlanFromRisk,
      updateActionPlanStatus,
      focusedOperationalItem,
      setFocusedOperationalItem,
      clearFocusedOperationalItem,
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
