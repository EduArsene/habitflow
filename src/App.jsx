import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Flame,
  Trophy,
  Plus,
  Trash2,
  RotateCcw,
  Sun,
  Moon,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  BookOpen,
  Droplets,
  Utensils,
  Briefcase,
  Heart,
  Sparkles,
  Check,
  Filter,
  BarChart3,
  Award,
  Zap,
  X,
  Cloud,
  Smartphone,
  Copy,
  Download,
  Upload,
  RefreshCw,
  KeyRound,
  Link2,
  CheckCheck,
  Laptop
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyB0t03ubJ_SNfZIYc8fa7LcviVJdBxJZ0w",
  authDomain: "habitos-2b99b.firebaseapp.com",
  projectId: "habitos-2b99b",
  storageBucket: "habitos-2b99b.firebasestorage.app",
  messagingSenderId: "754377337642",
  appId: "1:754377337642:web:eb365eff12299a9701cc53"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "habitflow-prod";

// Días de la semana
const DAYS_OF_WEEK = [
  { short: 'Lun', full: 'Lunes', index: 0 },
  { short: 'Mar', full: 'Martes', index: 1 },
  { short: 'Mié', full: 'Miércoles', index: 2 },
  { short: 'Jue', full: 'Jueves', index: 3 },
  { short: 'Vie', full: 'Viernes', index: 4 },
  { short: 'Sáb', full: 'Sábado', index: 5 },
  { short: 'Dom', full: 'Domingo', index: 6 }
];

// Categorías disponibles
const CATEGORIES = {
  Nutrición: { label: 'Nutrición', icon: Utensils, badgeLight: 'bg-emerald-100 text-emerald-800 border-emerald-200', badgeDark: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' },
  Salud: { label: 'Salud', icon: Activity, badgeLight: 'bg-rose-100 text-rose-800 border-rose-200', badgeDark: 'bg-rose-950/60 text-rose-300 border-rose-800/50' },
  Desarrollo: { label: 'Desarrollo/Trabajo', icon: Briefcase, badgeLight: 'bg-indigo-100 text-indigo-800 border-indigo-200', badgeDark: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50' },
  Personal: { label: 'Personal', icon: Sparkles, badgeLight: 'bg-amber-100 text-amber-800 border-amber-200', badgeDark: 'bg-amber-950/60 text-amber-300 border-amber-800/50' }
};

// Paleta de colores para hábitos
const COLOR_OPTIONS = [
  { id: 'emerald', name: 'Esmeralda', hex: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-500', lightBg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { id: 'indigo', name: 'Índigo', hex: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-500', ring: 'ring-indigo-500', lightBg: 'bg-indigo-50 dark:bg-indigo-950/40' },
  { id: 'rose', name: 'Rosa', hex: '#f43f5e', bg: 'bg-rose-500', text: 'text-rose-500', ring: 'ring-rose-500', lightBg: 'bg-rose-50 dark:bg-rose-950/40' },
  { id: 'amber', name: 'Ámbar', hex: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-950/40' },
  { id: 'cyan', name: 'Cian', hex: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-500', ring: 'ring-cyan-500', lightBg: 'bg-cyan-50 dark:bg-cyan-950/40' },
  { id: 'violet', name: 'Violeta', hex: '#8b5cf6', bg: 'bg-violet-500', text: 'text-violet-500', ring: 'ring-violet-500', lightBg: 'bg-violet-50 dark:bg-violet-950/40' }
];

// Iconos seleccionables
const ICON_OPTIONS = {
  utensils: Utensils,
  activity: Activity,
  book: BookOpen,
  droplets: Droplets,
  briefcase: Briefcase,
  heart: Heart,
  sparkles: Sparkles,
  zap: Zap
};

// Datos iniciales de muestra enriquecidos
const INITIAL_HABITS = [
  {
    id: 'h-1',
    name: 'Pesaje de porciones y macros',
    category: 'Nutrición',
    color: 'emerald',
    icon: 'utensils',
    completedDays: [true, true, true, true, true, false, true],
    priorStreak: 5 // Días acumulados de la semana previa para dar realismo
  },
  {
    id: 'h-2',
    name: 'Entrenamiento físico (Fuerza/Cardio)',
    category: 'Salud',
    color: 'rose',
    icon: 'activity',
    completedDays: [true, false, true, true, true, true, false],
    priorStreak: 2
  },
  {
    id: 'h-3',
    name: 'Documentación y lectura técnica',
    category: 'Desarrollo',
    color: 'indigo',
    icon: 'book',
    completedDays: [true, true, true, false, true, true, true],
    priorStreak: 4
  },
  {
    id: 'h-4',
    name: 'Hidratación 2.5L diarios',
    category: 'Salud',
    color: 'cyan',
    icon: 'droplets',
    completedDays: [true, true, true, true, true, true, true],
    priorStreak: 7
  },
  {
    id: 'h-5',
    name: 'Planificación y enfoque sin pantallas',
    category: 'Personal',
    color: 'amber',
    icon: 'sparkles',
    completedDays: [false, true, true, true, true, false, true],
    priorStreak: 0
  }
];

export default function App() {
  // Obtener el índice del día actual real (0 = Lunes, ..., 6 = Domingo)
  const getRealTodayIndex = () => {
    const jsDay = new Date().getDay(); // 0 es Domingo
    return jsDay === 0 ? 6 : jsDay - 1;
  };

  const [user, setUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('connecting'); // 'connecting' | 'synced' | 'saving' | 'error'
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoadedFromCloud, setIsLoadedFromCloud] = useState(false);

  // Clave de sincronización entre dispositivos (permite compartir el mismo documento en PC y Celular)
  const [syncKey, setSyncKey] = useState('eduardo-default-sync');
  const [syncKeyInput, setSyncKeyInput] = useState('eduardo-default-sync');
  const [syncKeySavedMsg, setSyncKeySavedMsg] = useState(false);

  const [activeDayIndex, setActiveDayIndex] = useState(getRealTodayIndex);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
  
  // Estados para modales y confirmaciones
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [copiedUid, setCopiedUid] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importMessage, setImportMessage] = useState('');

  // Estado del formulario de nuevo hábito
  const [newHabit, setNewHabit] = useState({
    name: '',
    category: 'Salud',
    color: 'indigo',
    icon: 'activity'
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!auth) {
      setSyncStatus('error');
      return;
    }
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Error en autenticación:', err);
        setSyncStatus('error');
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    const cleanKey = (syncKey || 'default').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    // Usamos la ruta compartida con el Código de Sincronización para que PC y Celular lean el mismo documento
    const sharedStateRef = doc(db, 'artifacts', appId, 'public', 'data', 'habitflow_sync', `key_${cleanKey}`);

    setSyncStatus('connecting');
    const unsubscribe = onSnapshot(
      sharedStateRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.habits && Array.isArray(data.habits)) {
            setHabits(data.habits);
          }
          if (typeof data.darkMode === 'boolean') {
            setDarkMode(data.darkMode);
          }
          setIsLoadedFromCloud(true);
          setSyncStatus('synced');
        } else {
          // Inicializar documento por primera vez en la nube bajo esta clave
          setDoc(sharedStateRef, {
            habits: INITIAL_HABITS,
            darkMode: true,
            syncKey: cleanKey,
            updatedAt: new Date().toISOString()
          })
            .then(() => {
              setIsLoadedFromCloud(true);
              setSyncStatus('synced');
            })
            .catch((err) => {
              console.error('Error creando documento inicial:', err);
              setSyncStatus('error');
            });
        }
      },
      (error) => {
        console.error('Error escuchando cambios en la nube:', error);
        setSyncStatus('error');
      }
    );

    return () => unsubscribe();
  }, [user, syncKey]);

  const saveStateToCloud = async (updatedHabits, updatedDarkMode = darkMode) => {
    if (!user || !db) return;
    setSyncStatus('saving');
    try {
      const cleanKey = (syncKey || 'default').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      const sharedStateRef = doc(db, 'artifacts', appId, 'public', 'data', 'habitflow_sync', `key_${cleanKey}`);
      await setDoc(
        sharedStateRef,
        {
          habits: updatedHabits,
          darkMode: updatedDarkMode,
          syncKey: cleanKey,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error guardando en la nube:', err);
      setSyncStatus('error');
    }
  };

  const handleApplySyncKey = (e) => {
    e.preventDefault();
    if (!syncKeyInput.trim()) return;
    const normalized = syncKeyInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    setSyncKeyInput(normalized);
    setSyncKey(normalized);
    setSyncKeySavedMsg(true);
    setTimeout(() => setSyncKeySavedMsg(false), 3000);
  };

  // Función para calcular la racha actual y máxima de un hábito hasta el día activo
  const calculateHabitStats = (habit, upToDayIdx) => {
    // 1. Porcentaje semanal total (sobre los 7 días de la vista)
    const completedCount = habit.completedDays.filter(Boolean).length;
    const weeklyPercentage = Math.round((completedCount / 7) * 100);

    // 2. Racha consecutiva actual evaluando desde el día activo hacia atrás
    let currentStreak = 0;
    let checkIndex = upToDayIdx;

    // Si hoy aún no está marcado pero ayer sí lo estuvo, contamos la racha viva desde ayer
    if (!habit.completedDays[checkIndex] && checkIndex > 0 && habit.completedDays[checkIndex - 1]) {
      checkIndex = checkIndex - 1;
    }

    if (habit.completedDays[checkIndex]) {
      for (let i = checkIndex; i >= 0; i--) {
        if (habit.completedDays[i]) {
          currentStreak++;
        } else {
          break;
        }
      }
      // Si completó todos los días desde el lunes hasta el punto de corte, sumamos su racha previa
      const allCompletedSinceMonday = habit.completedDays.slice(0, checkIndex + 1).every(Boolean);
      if (allCompletedSinceMonday && habit.priorStreak) {
        currentStreak += habit.priorStreak;
      }
    }

    // 3. Mejor racha dentro de la semana
    let bestWeekStreak = 0;
    let tempStreak = 0;
    habit.completedDays.forEach((done) => {
      if (done) {
        tempStreak++;
        if (tempStreak > bestWeekStreak) bestWeekStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    return {
      completedCount,
      weeklyPercentage,
      currentStreak,
      bestWeekStreak
    };
  };

  // Hábitos enriquecidos con sus métricas calculadas
  const enrichedHabits = useMemo(() => {
    return habits.map((h) => ({
      ...h,
      stats: calculateHabitStats(h, activeDayIndex),
      colorObj: COLOR_OPTIONS.find((c) => c.id === h.color) || COLOR_OPTIONS[0]
    }));
  }, [habits, activeDayIndex]);

  // Hábitos filtrados por categoría
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'Todas') return enrichedHabits;
    return enrichedHabits.filter((h) => h.category === selectedCategory);
  }, [enrichedHabits, selectedCategory]);

  // Cálculo de KPIs superiores
  const kpis = useMemo(() => {
    const totalHabits = enrichedHabits.length;
    if (totalHabits === 0) {
      return {
        totalHabits: 0,
        weeklySuccessRate: 0,
        bestStreak: 0,
        bestStreakHabit: 'Sin hábitos',
        completedToday: 0,
        todayPercentage: 0
      };
    }

    const totalPossibleChecks = totalHabits * 7;
    const totalCompletedChecks = enrichedHabits.reduce((acc, h) => acc + h.stats.completedCount, 0);
    const weeklySuccessRate = Math.round((totalCompletedChecks / totalPossibleChecks) * 100);

    let bestStreak = 0;
    let bestStreakHabit = 'Ninguno';
    enrichedHabits.forEach((h) => {
      if (h.stats.currentStreak > bestStreak) {
        bestStreak = h.stats.currentStreak;
        bestStreakHabit = h.name;
      }
    });

    const completedToday = enrichedHabits.filter((h) => h.completedDays[activeDayIndex]).length;
    const todayPercentage = Math.round((completedToday / totalHabits) * 100);

    return {
      totalHabits,
      weeklySuccessRate,
      bestStreak,
      bestStreakHabit,
      completedToday,
      todayPercentage
    };
  }, [enrichedHabits, activeDayIndex]);

  // Datos para el gráfico semanal (Lun - Dom)
  const weeklyChartData = useMemo(() => {
    const total = habits.length;
    return DAYS_OF_WEEK.map((day, idx) => {
      const completed = habits.filter((h) => h.completedDays[idx]).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: day.short,
        fullName: day.full,
        completados: completed,
        total: total,
        porcentaje: percentage,
        isToday: idx === activeDayIndex
      };
    });
  }, [habits, activeDayIndex]);

  // Alternar un día de un hábito
  const toggleHabitDay = (habitId, dayIdx) => {
    const updatedHabits = habits.map((h) => {
      if (h.id !== habitId) return h;
      const updatedDays = [...h.completedDays];
      updatedDays[dayIdx] = !updatedDays[dayIdx];
      return { ...h, completedDays: updatedDays };
    });
    setHabits(updatedHabits);
    saveStateToCloud(updatedHabits, darkMode);
  };

  // Marcar todos los hábitos del día activo
  const markAllToday = () => {
    const allCompletedToday = habits.every((h) => h.completedDays[activeDayIndex]);
    const updatedHabits = habits.map((h) => {
      const updatedDays = [...h.completedDays];
      updatedDays[activeDayIndex] = !allCompletedToday;
      return { ...h, completedDays: updatedDays };
    });
    setHabits(updatedHabits);
    saveStateToCloud(updatedHabits, darkMode);
  };

  // Agregar nuevo hábito
  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.name.trim()) {
      setFormError('Por favor, ingresa un nombre para el hábito.');
      return;
    }

    const created = {
      id: `h-${Date.now()}`,
      name: newHabit.name.trim(),
      category: newHabit.category,
      color: newHabit.color,
      icon: newHabit.icon,
      completedDays: [false, false, false, false, false, false, false],
      priorStreak: 0
    };

    const updatedHabits = [...habits, created];
    setHabits(updatedHabits);
    saveStateToCloud(updatedHabits, darkMode);
    setNewHabit({ name: '', category: 'Salud', color: 'indigo', icon: 'activity' });
    setFormError('');
    setIsAddModalOpen(false);
  };

  // Eliminar hábito confirmado
  const confirmDeleteHabit = () => {
    if (!habitToDelete) return;
    const updatedHabits = habits.filter((h) => h.id !== habitToDelete.id);
    setHabits(updatedHabits);
    saveStateToCloud(updatedHabits, darkMode);
    setHabitToDelete(null);
  };

  // Restablecer datos de prueba
  const handleResetDemoData = () => {
    setHabits(INITIAL_HABITS);
    saveStateToCloud(INITIAL_HABITS, darkMode);
    setSelectedCategory('Todas');
    setIsResetConfirmOpen(false);
  };

  // Alternar tema oscuro/claro y guardar en la nube
  const handleToggleDarkMode = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    saveStateToCloud(habits, nextTheme);
  };

  // Exportar respaldo en JSON al portapapeles
  const handleExportBackup = () => {
    const backupStr = JSON.stringify(habits, null, 2);
    navigator.clipboard.writeText(backupStr);
    setImportMessage('¡Copia de seguridad copiada al portapapeles!');
    setTimeout(() => setImportMessage(''), 3000);
  };

  // Importar respaldo JSON
  const handleImportBackup = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed)) {
        setHabits(parsed);
        saveStateToCloud(parsed, darkMode);
        setImportJsonText('');
        setImportMessage('¡Hábitos importados y guardados en la nube!');
        setTimeout(() => setImportMessage(''), 3000);
      } else {
        setImportMessage('Formato inválido. Debe ser una lista de hábitos.');
      }
    } catch (e) {
      setImportMessage('Error al leer el JSON. Verifica el texto pegado.');
    }
  };

  // Tooltip personalizado para Recharts
  const CustomChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3.5 rounded-xl shadow-xl border backdrop-blur-md ${
          darkMode 
            ? 'bg-slate-900/95 border-slate-700 text-slate-100' 
            : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm">{data.fullName}</span>
            {data.isToday && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Día Activo
              </span>
            )}
          </div>
          <div className="text-xs space-y-1">
            <p className="flex items-center justify-between gap-4">
              <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Cumplimiento:</span>
              <span className="font-bold text-indigo-500">{data.porcentaje}%</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Objetivos logrados:</span>
              <span className="font-semibold">{data.completados} de {data.total}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-16">
        
        {/* Decoración superior de fondo */}
        <div className="fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-500/10 via-emerald-500/5 to-transparent pointer-events-none z-0" />

        {/* BARRA DE NAVEGACIÓN SUPERIOR */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            
            {/* Logo y Título */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    HabitFlow Pro
                  </h1>
                  {/* Indicador de Estado en la Nube */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      syncStatus === 'synced'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : syncStatus === 'saving' || syncStatus === 'connecting'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {syncStatus === 'saving' || syncStatus === 'connecting' ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Cloud className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">
                      {syncStatus === 'synced'
                        ? 'Guardado en la nube'
                        : syncStatus === 'saving'
                        ? 'Sincronizando...'
                        : syncStatus === 'connecting'
                        ? 'Conectando...'
                        : 'Modo sin conexión'}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Control de objetivos diarios, consistencia y rachas
                </p>
              </div>
            </div>

            {/* Controles de Cabecera */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Selector de "Día Activo" para simular qué día es hoy */}
              <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Hoy es:
                </span>
                {DAYS_OF_WEEK.map((d) => (
                  <button
                    key={d.index}
                    onClick={() => setActiveDayIndex(d.index)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeDayIndex === d.index
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                    }`}
                    title={`Simular que hoy es ${d.full}`}
                  >
                    {d.short}
                  </button>
                ))}
              </div>

              {/* Botón guía para Celular y Respaldo */}
              <button
                onClick={() => setIsMobileModalOpen(true)}
                className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Sincronizar entre dispositivos y acceso directo"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden md:inline">Sincronizar Dispositivos</span>
              </button>

              {/* Botón Restablecer Datos */}
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
                title="Restablecer datos de prueba"
              >
                <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="hidden lg:inline">Restablecer</span>
              </button>

              {/* Botón Tema Oscuro/Claro */}
              <button
                onClick={handleToggleDarkMode}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Cambiar tema"
                title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* Botón Nuevo Hábito */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nuevo Hábito</span>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

          {/* Selector de día en móvil */}
          <div className="flex md:hidden items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Día actual:
            </span>
            <div className="flex items-center gap-1">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d.index}
                  onClick={() => setActiveDayIndex(d.index)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeDayIndex === d.index
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>

          {/* 1. TARJETAS DE RESUMEN (KPIs) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* KPI 1: Total de Hábitos Activos */}
            <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Hábitos Activos
                  </p>
                  <h3 className="text-3xl font-extrabold mt-2 text-slate-900 dark:text-white">
                    {kpis.totalHabits}
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Meta semanal: {kpis.totalHabits * 7} registros</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">En seguimiento</span>
              </div>
            </div>

            {/* KPI 2: Tasa de Éxito Semanal */}
            <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Tasa de Éxito Semanal
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {kpis.weeklySuccessRate}%
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      kpis.weeklySuccessRate >= 75
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : kpis.weeklySuccessRate >= 50
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}>
                      {kpis.weeklySuccessRate >= 75 ? 'Excelente' : kpis.weeklySuccessRate >= 50 ? 'En progreso' : 'Por mejorar'}
                    </span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${kpis.weeklySuccessRate}%` }}
                />
              </div>
            </div>

            {/* KPI 3: Mejor Racha Actual */}
            <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Mejor Racha Actual
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {kpis.bestStreak}
                    </h3>
                    <span className="text-sm font-semibold text-amber-500">días seguidos</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 truncate" title={kpis.bestStreakHabit}>
                Líder: <strong className="text-slate-700 dark:text-slate-200">{kpis.bestStreakHabit}</strong>
              </p>
            </div>

            {/* KPI 4: Hábitos Completados Hoy */}
            <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Completados ({DAYS_OF_WEEK[activeDayIndex].short})
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {kpis.completedToday} <span className="text-lg font-normal text-slate-400">/ {kpis.totalHabits}</span>
                    </h3>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">{kpis.todayPercentage}% del día logrado</span>
                {kpis.totalHabits > 0 && (
                  <button
                    onClick={markAllToday}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {kpis.completedToday === kpis.totalHabits ? 'Desmarcar hoy' : 'Completar hoy'}
                  </button>
                )}
              </div>
            </div>

          </section>

          {/* 2. MATRIZ DE SEGUIMIENTO SEMANAL (Lunes a Domingo) */}
          <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
            
            {/* Cabecera de la tabla y filtros */}
            <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Registro de Objetivos Diarios</span>
                  <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Semana Actual
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Marca o desmarca cada casilla para actualizar tus rachas y métricas en tiempo real.
                </p>
              </div>

              {/* Filtros por categoría */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
                {['Todas', ...Object.keys(CATEGORIES)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'Desarrollo' ? 'Desarrollo/Trabajo' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla Responsiva de Hábitos */}
            {filteredHabits.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No hay hábitos en esta vista
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Agrega un nuevo objetivo diario o cambia el filtro de categoría para visualizar tu progreso semanal.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition"
                >
                  <Plus className="w-4 h-4" />
                  Crear Hábito Ahora
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-200/70 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <th className="py-3.5 pl-6 pr-4 w-[32%]">Hábito y Categoría</th>
                      {DAYS_OF_WEEK.map((day) => {
                        const isToday = day.index === activeDayIndex;
                        return (
                          <th
                            key={day.short}
                            className={`py-3.5 px-2 text-center w-12 transition-colors ${
                              isToday ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10' : ''
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <span>{day.short}</span>
                              {isToday && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1" />
                              )}
                            </div>
                          </th>
                        );
                      })}
                      <th className="py-3.5 px-4 text-center w-28">Racha Actual</th>
                      <th className="py-3.5 px-4 text-left w-40">Progreso Semanal</th>
                      <th className="py-3.5 pl-2 pr-6 text-right w-14">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-sm">
                    {filteredHabits.map((habit) => {
                      const IconComponent = ICON_OPTIONS[habit.icon] || Activity;
                      const catInfo = CATEGORIES[habit.category] || CATEGORIES.Personal;
                      const colorCfg = habit.colorObj;

                      return (
                        <tr
                          key={habit.id}
                          className="group hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Nombre, Icono y Categoría */}
                          <td className="py-4 pl-6 pr-4">
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorCfg.lightBg} ${colorCfg.text} border border-current/10`}
                              >
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {habit.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                      darkMode ? catInfo.badgeDark : catInfo.badgeLight
                                    }`}
                                  >
                                    {catInfo.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Casillas Lunes a Domingo */}
                          {habit.completedDays.map((isDone, dayIdx) => {
                            const isToday = dayIdx === activeDayIndex;
                            return (
                              <td
                                key={dayIdx}
                                className={`py-4 px-2 text-center transition-colors ${
                                  isToday ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''
                                }`}
                              >
                                <button
                                  onClick={() => toggleHabitDay(habit.id, dayIdx)}
                                  aria-label={`Marcar ${habit.name} el ${DAYS_OF_WEEK[dayIdx].full}`}
                                  className={`w-9 h-9 rounded-xl inline-flex items-center justify-center transition-all duration-200 transform active:scale-90 ${
                                    isDone
                                      ? `${colorCfg.bg} text-white shadow-md shadow-current/20 scale-100`
                                      : 'bg-slate-100 dark:bg-slate-800/90 text-transparent hover:border-slate-300 dark:hover:border-slate-600 border border-slate-200/80 dark:border-slate-700/80'
                                  }`}
                                >
                                  <Check className={`w-4 h-4 stroke-[3] transition-transform ${isDone ? 'scale-100' : 'scale-0'}`} />
                                </button>
                              </td>
                            );
                          })}

                          {/* Indicador de Racha Actual */}
                          <td className="py-4 px-4 text-center">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                habit.stats.currentStreak > 0
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              <Flame
                                className={`w-3.5 h-3.5 ${
                                  habit.stats.currentStreak > 0 ? 'text-amber-500 fill-amber-500 animate-pulse' : ''
                                }`}
                              />
                              <span>{habit.stats.currentStreak} d</span>
                            </div>
                          </td>

                          {/* Barra de Progreso Semanal Individual */}
                          <td className="py-4 px-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                  {habit.stats.weeklyPercentage}%
                                </span>
                                <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                                  {habit.stats.completedCount}/7 días
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${colorCfg.bg}`}
                                  style={{ width: `${habit.stats.weeklyPercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Botón Eliminar */}
                          <td className="py-4 pl-2 pr-6 text-right">
                            <button
                              onClick={() => setHabitToDelete(habit)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Eliminar hábito"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 3. SECCIÓN DE GRÁFICOS Y COMPARATIVA DE RENDIMIENTO */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gráfico Interactivo de Cumplimiento Diario (Lun - Dom) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-500" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Tendencia de Cumplimiento Semanal
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Porcentaje de objetivos diarios completados de Lunes a Domingo
                    </p>
                  </div>

                  {/* Selector de tipo de gráfico */}
                  <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 self-start">
                    <button
                      onClick={() => setChartType('area')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        chartType === 'area'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Línea Suave
                    </button>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        chartType === 'bar'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Barras
                    </button>
                  </div>
                </div>

                {/* Contenedor Recharts */}
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                      <AreaChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPorcentaje" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke={darkMode ? '#1e293b' : '#e2e8f0'}
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) => `${val}%`}
                          tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="porcentaje"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorPorcentaje)"
                          activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#6366f1' }}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke={darkMode ? '#1e293b' : '#e2e8f0'}
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(val) => `${val}%`}
                          tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomChartTooltip />} cursor={{ fill: darkMode ? '#1e293b' : '#f1f5f9', opacity: 0.5 }} />
                        <Bar dataKey="porcentaje" radius={[8, 8, 0, 0]} maxBarSize={42}>
                          {weeklyChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.isToday ? '#10b981' : '#6366f1'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie del gráfico con resumen rápido */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                    Progreso diario (%)
                  </span>
                  {chartType === 'bar' && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Día activo ({DAYS_OF_WEEK[activeDayIndex].short})
                    </span>
                  )}
                </div>
                <span className="font-medium">
                  Promedio semanal: <strong className="text-slate-800 dark:text-slate-200">{kpis.weeklySuccessRate}%</strong>
                </span>
              </div>
            </div>

            {/* Comparativa Visual del Rendimiento de cada Hábito */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Rendimiento por Hábito
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Comparativa de consistencia y rachas individuales
                    </p>
                  </div>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {[...enrichedHabits]
                    .sort((a, b) => b.stats.weeklyPercentage - a.stats.weeklyPercentage)
                    .map((habit) => {
                      const colorCfg = habit.colorObj;
                      return (
                        <div
                          key={habit.id}
                          className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorCfg.bg}`} />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                {habit.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-0.5">
                                <Flame className="w-3 h-3 fill-amber-500" />
                                {habit.stats.currentStreak}d
                              </span>
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                {habit.stats.weeklyPercentage}%
                              </span>
                            </div>
                          </div>

                          <div className="w-full h-2.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${colorCfg.bg}`}
                              style={{ width: `${habit.stats.weeklyPercentage}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                            <span>Categoría: {habit.category}</span>
                            <span>{habit.stats.completedCount} de 7 días completados</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Ordenado por mayor cumplimiento</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5" />
                  Sincronizado en la nube
                </span>
              </div>
            </div>

          </section>
        </main>

        {}
        {/* MODAL DE ACCESO MÓVIL Y RESPALDO EN LA NUBE */}
        {isMobileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Sincronización Multi-Dispositivo
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Conecta tu PC y tu celular en tiempo real
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Código de Sincronización Personal */}
              <form onSubmit={handleApplySyncKey} className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    Código de Sincronización (PC ↔ Celular)
                  </label>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Activo: {syncKey}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Escribe la misma clave secreta en tu computadora y en tu teléfono para que ambos carguen y guarden exactamente los mismos hábitos al instante.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={syncKeyInput}
                    onChange={(e) => setSyncKeyInput(e.target.value)}
                    placeholder="Ej: eduardo-quimpac-2026"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Conectar Clave
                  </button>
                </div>
                {syncKeySavedMsg && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    ¡Conectado al canal "{syncKey}" en tiempo real!
                  </p>
                )}
              </form>

              {/* Estado de cuenta en la nube */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Cloud className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      WebSockets Firestore Activo (onSnapshot)
                    </p>
                    <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 truncate">
                      Sesión ID: {user ? user.uid : 'Conectando...'}
                    </p>
                  </div>
                </div>
                {user && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(syncKey);
                      setCopiedUid(true);
                      setTimeout(() => setCopiedUid(false), 2000);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedUid ? 'Clave Copiada' : 'Copiar Clave'}
                  </button>
                )}
              </div>

              {/* Sección de Respaldo / Transferencia Manual */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Copia de Seguridad / Exportar Datos
                  </span>
                  <button
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Copiar mis hábitos (JSON)
                  </button>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Pega aquí un respaldo JSON si deseas restaurar tus hábitos en otro entorno..."
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-500 font-medium">
                      {importMessage}
                    </span>
                    {importJsonText.trim() && (
                      <button
                        onClick={handleImportBackup}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Importar y Guardar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PARA AGREGAR NUEVO HÁBITO */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Nuevo Hábito Diario
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormError('');
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddHabit} className="space-y-4">
                {/* Nombre del hábito */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Nombre del Objetivo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Meditación 15 min, Estudiar inglés..."
                    value={newHabit.name}
                    onChange={(e) => {
                      setNewHabit({ ...newHabit, name: e.target.value });
                      if (formError) setFormError('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  {formError && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{formError}</p>
                  )}
                </div>

                {/* Selección de Categoría */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Categoría
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(CATEGORIES).map((catKey) => {
                      const cat = CATEGORIES[catKey];
                      const CatIcon = cat.icon;
                      const isSelected = newHabit.category === catKey;
                      return (
                        <button
                          type="button"
                          key={catKey}
                          onClick={() => setNewHabit({ ...newHabit, category: catKey })}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <CatIcon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selección de Color */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Color Identificador
                  </label>
                  <div className="flex items-center gap-2.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setNewHabit({ ...newHabit, color: c.id })}
                        className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center transition-transform ${
                          newHabit.color === c.id ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110' : 'opacity-75 hover:opacity-100'
                        }`}
                        title={c.name}
                      >
                        {newHabit.color === c.id && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selección de Ícono */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Ícono
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {Object.keys(ICON_OPTIONS).map((iconKey) => {
                      const IconComp = ICON_OPTIONS[iconKey];
                      const isSelected = newHabit.icon === iconKey;
                      return (
                        <button
                          type="button"
                          key={iconKey}
                          onClick={() => setNewHabit({ ...newHabit, icon: iconKey })}
                          className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setFormError('');
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition"
                  >
                    Guardar Hábito
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR HÁBITO */}
        {habitToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              {}
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ¿Eliminar este hábito?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Se eliminará <strong className="text-slate-700 dark:text-slate-200">"{habitToDelete.name}"</strong> junto con su historial de progreso semanal.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setHabitToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteHabit}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/25 transition"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMACIÓN PARA RESTABLECER DATOS */}
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ¿Restablecer datos de demostración?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tus cambios personalizados se reemplazarán por los hábitos predeterminados de ejemplo.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetDemoData}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition"
                >
                  Restablecer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}