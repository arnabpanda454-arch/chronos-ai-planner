import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Clock, Moon, Sun, Utensils, Target, Sparkles,
  CheckCircle2, Plus, Trash2, ArrowRight, ArrowLeft, RefreshCw,
  Play, Pause, RotateCcw, Flame, Zap, ShieldAlert, ListChecks,
  Send, Award, BookOpen, Layers, Sliders, ChevronRight,
  Check, AlertCircle, Coffee, Brain, Key, Save, Download, X, Volume2,
  Activity, Dumbbell, Heart, UserCheck, BookMarked, Edit3, Filter,
  BarChart3, Settings, Smile, BatteryCharging, Tag, LayoutGrid, CheckSquare, FileText
} from 'lucide-react';

// ============================================================================
// CONSTANTS & STORAGE KEYS
// ============================================================================
const defaultApiKey = ""; // Canvas runtime automatically injects the key when empty
const STORAGE_KEY = "chronos_ai_state_v3";
const API_KEY_STORAGE = "chronos_gemini_api_key";

const DEFAULT_FIXED_SCHEDULES = [
  { id: 'f1', title: 'Core Work / University Classes', startTime: '09:00', endTime: '17:00', category: 'Work' },
  { id: 'f2', title: 'Daily Commute & Transit', startTime: '08:15', endTime: '09:00', category: 'Commute' },
  { id: 'f3', title: 'Evening Commute', startTime: '17:00', endTime: '17:45', category: 'Commute' }
];

const DEFAULT_BIO_SCHEDULE = {
  sleepStart: '23:00',
  wakeUp: '06:30',
  windDownMinutes: 45,
  chronotype: 'Morning Peak (Lark)',
  meals: [
    { id: 'm1', name: 'Breakfast & Hydration', time: '07:15', duration: 30 },
    { id: 'm2', name: 'Mid-Day Lunch', time: '13:00', duration: 45 },
    { id: 'm3', name: 'Healthy Dinner', time: '19:45', duration: 45 }
  ]
};

const DEFAULT_GOALS_DATA = {
  timeframe: '90 Days (Quarter Mastery)',
  intensity: 'Balanced High-Performance',
  goals: [
    { id: 'g1', title: 'Master Full-Stack AI Engineering', priority: 'High', dailyMinutes: 90, notes: 'Build portfolio projects and practice algorithms' },
    { id: 'g2', title: 'Boxing & Athletic Conditioning', priority: 'High', dailyMinutes: 45, notes: 'Heavy bag drills + strength training' },
    { id: 'g3', title: 'Daily Gym & Mobility', priority: 'High', dailyMinutes: 45, notes: 'Compound lifts + 10k steps' },
    { id: 'g4', title: 'Read 15 Non-Fiction Books', priority: 'Medium', dailyMinutes: 30, notes: 'Before bed wind-down reading' }
  ]
};

const DEFAULT_MORE_ABOUT_ME = {
  workEnvironment: 'Hybrid (Home & Office)',
  energySlumpTime: '14:30 - 16:00 Afternoon Dip',
  focusStyle: 'Pomodoro Sprint (25-45 min bursts)',
  caffeineCutoff: '14:00',
  stressTriggers: 'Back-to-back meetings without transition buffers, late-night screen exposure',
  personalConstraints: 'Need 15-min decompression after evening commute; prefer physical training in late afternoon or early morning',
  motivationDrivers: 'Visual streak grids, clear micro-steps, measurable daily progress',
  customVariables: [
    { id: 'cv1', label: 'Recovery Need', value: 'High after leg/boxing days' },
    { id: 'cv2', label: 'Learning Style', value: 'Hands-on coding before theory' },
    { id: 'cv3', label: 'Weather / Local Factor', value: 'Avoid outdoor cardio during peak afternoon heat' }
  ]
};

// Color palettes for HabitKit-style dot-matrix cards
const CARD_PALETTES = {
  rose: {
    name: 'Coral Rose',
    iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
    checkDone: 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30',
    dotActive: 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.45)]',
    dotInactive: 'bg-rose-950/35 hover:bg-rose-900/50',
    dotTodayRing: 'ring-1 ring-rose-400/80',
    textAccent: 'text-rose-400'
  },
  emerald: {
    name: 'Emerald Mint',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    checkDone: 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30',
    dotActive: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.45)]',
    dotInactive: 'bg-emerald-950/35 hover:bg-emerald-900/50',
    dotTodayRing: 'ring-1 ring-emerald-400/80',
    textAccent: 'text-emerald-400'
  },
  indigo: {
    name: 'Electric Indigo',
    iconBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
    checkDone: 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/30',
    dotActive: 'bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.45)]',
    dotInactive: 'bg-indigo-950/40 hover:bg-indigo-900/50',
    dotTodayRing: 'ring-1 ring-indigo-400/80',
    textAccent: 'text-indigo-400'
  },
  amber: {
    name: 'Solar Amber',
    iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    checkDone: 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30',
    dotActive: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.45)]',
    dotInactive: 'bg-amber-950/35 hover:bg-amber-900/50',
    dotTodayRing: 'ring-1 ring-amber-400/80',
    textAccent: 'text-amber-400'
  },
  purple: {
    name: 'Neon Violet',
    iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    checkDone: 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30',
    dotActive: 'bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.45)]',
    dotInactive: 'bg-purple-950/35 hover:bg-purple-900/50',
    dotTodayRing: 'ring-1 ring-purple-400/80',
    textAccent: 'text-purple-400'
  }
};

// ============================================================================
// DATE, HEATMAP & EXPORT HELPERS
// ============================================================================
function getISODate(dateObj = new Date()) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateTimeStamp(isoOrDate = new Date()) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Build a 7-row x N-column (default 20 weeks = 140 days) grid of ISO dates ending on the current week
function buildHeatmapGrid(weeksCount = 20) {
  const today = new Date();
  const todayISO = getISODate(today);
  // Align end of last column to end of current week (Saturday)
  const dayOfWeek = today.getDay(); // 0 (Sun) .. 6 (Sat)
  const endOfGrid = new Date(today);
  endOfGrid.setDate(today.getDate() + (6 - dayOfWeek));

  const totalDays = weeksCount * 7;
  const startOfGrid = new Date(endOfGrid);
  startOfGrid.setDate(endOfGrid.getDate() - totalDays + 1);

  const columns = [];
  const cursor = new Date(startOfGrid);
  for (let w = 0; w < weeksCount; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const iso = getISODate(cursor);
      col.push({
        iso,
        label: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: iso === todayISO,
        isFuture: cursor > today && iso !== todayISO
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    columns.push(col);
  }
  return columns;
}

// Generate realistic initial historical completions so new cards immediately showcase the visual progress grid
function seedHistoryForId(idStr) {
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) % 100000;
  }
  const history = {};
  const today = new Date();
  // Seed past 45 days with a realistic clustered pattern
  for (let offset = 1; offset <= 45; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    const iso = getISODate(d);
    const pseudo = ((hash + offset * 17) % 10);
    if (offset <= 28 && pseudo >= 3) {
      history[iso] = true;
    } else if (offset > 28 && offset <= 42 && pseudo >= 6) {
      history[iso] = true;
    }
  }
  return history;
}

function calculateStreakFromHistory(historyMap = {}) {
  const today = new Date();
  let streak = 0;
  const cursor = new Date(today);
  // If today is not yet ticked, start checking from yesterday so active streak is preserved
  if (!historyMap[getISODate(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (historyMap[getISODate(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function timeToMinutes(hhmm) {
  if (!hhmm || !hhmm.includes(':')) return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h * 60) + m;
}

function formatMinutesToDuration(mins) {
  if (mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function playFocusChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Ignore audio errors
  }
}

function downloadWorksheetAsICS(worksheet) {
  if (!worksheet?.schedule?.length) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`;

  const toICSDateTime = (hhmm) => `${dateStr}T${hhmm.replace(':', '')}00`;

  const events = worksheet.schedule.map((block) => {
    const steps = (block.actionableMicroSteps || []).map((s, i) => `${i + 1}. ${s}`).join('\\n');
    const desc = `${block.aiTip || ''}\\n\\nMicro-Steps:\\n${steps}`.replace(/,/g, '\\,');
    return [
      'BEGIN:VEVENT',
      `UID:${block.id || Math.random().toString(36).slice(2)}@chronos-ai`,
      `DTSTAMP:${dateStr}T000000Z`,
      `DTSTART:${toICSDateTime(block.startTime)}`,
      `DTEND:${toICSDateTime(block.endTime)}`,
      `SUMMARY:[${block.category}] ${block.title}`,
      `DESCRIPTION:${desc}`,
      'END:VEVENT'
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chronos AI//Gemini Calibrator//EN',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chronos-worksheet-${dateStr}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// GEMINI API HELPER WITH SMART RETRY, TIMEOUT & ENV/UI KEY SUPPORT
// ============================================================================
async function callGeminiAPI(prompt, systemInstruction, responseSchema = null, customApiKey = "") {
  const envKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || "";
  const effectiveKey = customApiKey?.trim() || envKey || defaultApiKey;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${effectiveKey}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  if (responseSchema) {
    payload.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    };
  }

  const delays = [1000, 2000, 4000];
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errDetail = `API status ${response.status}`;
        try {
          const errJson = await response.json();
          errDetail = errJson?.error?.message || errDetail;
        } catch {
          // ignore parse failure
        }
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          const nonRetryErr = new Error(errDetail);
          nonRetryErr.noRetry = true;
          throw nonRetryErr;
        }
        throw new Error(errDetail);
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response from Gemini");

      if (!responseSchema) return text;

      const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.noRetry || attempt === delays.length) {
        throw error;
      }
      await new Promise(res => setTimeout(res, delays[attempt]));
    }
  }
}

// ============================================================================
// JSON SCHEMAS FOR GEMINI OUTPUTS
// ============================================================================
const ROADMAP_SCHEMA = {
  type: "OBJECT",
  properties: {
    researchSummary: { type: "STRING" },
    chronotypeAdvice: { type: "STRING" },
    scientificFramework: { type: "STRING" },
    personalVariableAdaptations: { type: "STRING" },
    phases: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          phaseName: { type: "STRING" },
          duration: { type: "STRING" },
          focus: { type: "STRING" },
          keyHabits: { type: "ARRAY", items: { type: "STRING" } },
          expectedOutcome: { type: "STRING" }
        },
        required: ["phaseName", "duration", "focus", "keyHabits", "expectedOutcome"]
      }
    },
    efficiencyHacks: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["researchSummary", "chronotypeAdvice", "scientificFramework", "personalVariableAdaptations", "phases", "efficiencyHacks"]
};

const WORKSHEET_SCHEMA = {
  type: "OBJECT",
  properties: {
    dailyMantra: { type: "STRING" },
    estimatedEfficiencyScore: { type: "INTEGER" },
    schedule: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          startTime: { type: "STRING" },
          endTime: { type: "STRING" },
          title: { type: "STRING" },
          category: { type: "STRING", enum: ["Fixed", "Bio/Meal", "Deep Work", "Habit", "Recovery"] },
          priority: { type: "STRING", enum: ["Critical", "High", "Medium", "Low"] },
          energyRequired: { type: "STRING", enum: ["High", "Medium", "Low"] },
          actionableMicroSteps: { type: "ARRAY", items: { type: "STRING" } },
          aiTip: { type: "STRING" }
        },
        required: ["id", "startTime", "endTime", "title", "category", "priority", "energyRequired", "actionableMicroSteps", "aiTip"]
      }
    },
    coreHabits: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          name: { type: "STRING" },
          triggerCue: { type: "STRING" },
          durationMinutes: { type: "INTEGER" },
          category: { type: "STRING" }
        },
        required: ["id", "name", "triggerCue", "durationMinutes", "category"]
      }
    }
  },
  required: ["dailyMantra", "estimatedEfficiencyScore", "schedule", "coreHabits"]
};

const JOURNAL_INSIGHT_SCHEMA = {
  type: "OBJECT",
  properties: {
    patternDetected: { type: "STRING" },
    praiseAndMomentum: { type: "STRING" },
    scheduleAdjustmentTip: { type: "STRING" },
    nextJournalPrompt: { type: "STRING" }
  },
  required: ["patternDetected", "praiseAndMomentum", "scheduleAdjustmentTip", "nextJournalPrompt"]
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const todayISO = useMemo(() => getISODate(new Date()), []);
  const heatmapColumns = useMemo(() => buildHeatmapGrid(22), []);

  // Load persisted state if available
  const savedState = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Navigation & Wizard State (Steps 1 to 5)
  const [currentStep, setCurrentStep] = useState(savedState?.currentStep || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorBanner, setErrorBanner] = useState(null);

  // Custom API Key & Settings Modal
  const [userApiKey, setUserApiKey] = useState(() => {
    try {
      return localStorage.getItem(API_KEY_STORAGE) || '';
    } catch {
      return '';
    }
  });
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Step 1: Fixed Schedules
  const [fixedSchedules, setFixedSchedules] = useState(
    savedState?.fixedSchedules || DEFAULT_FIXED_SCHEDULES
  );
  const [newFixed, setNewFixed] = useState({ title: '', startTime: '10:00', endTime: '11:00', category: 'Work' });

  // Step 2: Bio-Rhythm
  const [bioSchedule, setBioSchedule] = useState(
    savedState?.bioSchedule || DEFAULT_BIO_SCHEDULE
  );
  const [newMeal, setNewMeal] = useState({ name: '', time: '16:00', duration: 20 });

  // Step 3: Goals + "More About Me" Personal Variables
  const [goalsData, setGoalsData] = useState(
    savedState?.goalsData || DEFAULT_GOALS_DATA
  );
  const [newGoal, setNewGoal] = useState({ title: '', priority: 'High', dailyMinutes: 60, notes: '' });

  const [moreAboutMe, setMoreAboutMe] = useState(
    savedState?.moreAboutMe || DEFAULT_MORE_ABOUT_ME
  );
  const [newCustomVar, setNewCustomVar] = useState({ label: '', value: '' });
  const [showMoreAboutMeModal, setShowMoreAboutMeModal] = useState(false);

  // Step 4: AI Roadmap
  const [roadmap, setRoadmap] = useState(savedState?.roadmap || null);
  const [refinementInput, setRefinementInput] = useState("");
  const [refinementHistory, setRefinementHistory] = useState(savedState?.refinementHistory || []);

  // Step 5: Worksheet, HabitKit Heatmap History & Journals
  const [worksheet, setWorksheet] = useState(savedState?.worksheet || null);
  // Map of itemId -> { [YYYY-MM-DD]: boolean }
  const [completionHistory, setCompletionHistory] = useState(savedState?.completionHistory || {});
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [activeView, setActiveView] = useState('heatmap'); // 'heatmap' | 'timeline' | 'journals'
  const [expandedCards, setExpandedCards] = useState({});
  const [recalibratePrompt, setRecalibratePrompt] = useState("");
  const [showRecalibrateModal, setShowRecalibrateModal] = useState(false);
  const [showAddCustomTaskModal, setShowAddCustomTaskModal] = useState(false);
  const [newCustomTask, setNewCustomTask] = useState({
    title: '',
    category: 'Habit',
    startTime: '18:00',
    endTime: '18:45',
    cue: 'After work decompression',
    palette: 'rose'
  });

  // --- EVERYDAY JOURNALS & TASK MICRO-NOTES STATE ---
  const [journals, setJournals] = useState(() => {
    if (savedState?.journals) return savedState.journals;
    const now = new Date();
    return [
      {
        id: 'j_seed_1',
        title: 'Morning Calibration & Energy Check',
        promptType: 'Morning Intention',
        content: 'Slept 7.5 hours. Feeling sharp for the morning deep-work sprint and evening boxing session. Keeping caffeine before 2 PM.',
        mood: 'Energized',
        energyLevel: 4,
