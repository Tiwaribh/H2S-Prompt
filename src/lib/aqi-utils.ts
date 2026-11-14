export interface AQICategory {
  category: string;
  color: string;
  textColor: string;
  bgClass: string;
  badgeClass: string;
  borderClass: string;
  advisory: string;
  healthImpact: string;
}

export function getAQICategory(aqi: number | null | undefined): AQICategory {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return {
      category: 'No Data',
      color: '#94a3b8',
      textColor: 'text-slate-500',
      bgClass: 'bg-slate-100',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      borderClass: 'border-slate-300',
      advisory: 'Data is currently unavailable from public monitoring sources.',
      healthImpact: 'Unable to evaluate without valid readings.',
    };
  }

  if (aqi <= 50) {
    return {
      category: 'Good',
      color: '#16a34a',
      textColor: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      borderClass: 'border-emerald-500',
      advisory: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
      healthImpact: 'Minimal impact.',
    };
  } else if (aqi <= 100) {
    return {
      category: 'Satisfactory / Moderate',
      color: '#65a30d',
      textColor: 'text-lime-800',
      bgClass: 'bg-lime-50',
      badgeClass: 'bg-lime-100 text-lime-800 border-lime-300',
      borderClass: 'border-lime-500',
      advisory: 'Acceptable air quality; minor breathing discomfort to unusually sensitive people.',
      healthImpact: 'Minor breathing discomfort to sensitive individuals.',
    };
  } else if (aqi <= 200) {
    return {
      category: 'Moderate',
      color: '#d97706',
      textColor: 'text-amber-800',
      bgClass: 'bg-amber-50',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      borderClass: 'border-amber-500',
      advisory: 'Breathing discomfort to people with lungs, asthma and heart diseases.',
      healthImpact: 'Breathing discomfort to sensitive groups; general public rarely affected.',
    };
  } else if (aqi <= 300) {
    return {
      category: 'Poor / Unhealthy',
      color: '#ea580c',
      textColor: 'text-orange-800',
      bgClass: 'bg-orange-50',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
      borderClass: 'border-orange-500',
      advisory: 'Breathing discomfort to most people on prolonged exposure; avoid strenuous outdoor exercise.',
      healthImpact: 'Slight discomfort to general public, noticeable symptoms in sensitive individuals.',
    };
  } else if (aqi <= 400) {
    return {
      category: 'Very Poor',
      color: '#dc2626',
      textColor: 'text-red-800',
      bgClass: 'bg-red-50',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      borderClass: 'border-red-500',
      advisory: 'Respiratory illness on prolonged exposure. Significant risk for elders and children.',
      healthImpact: 'High risk of respiratory issues across population.',
    };
  } else {
    return {
      category: 'Severe / Hazardous',
      color: '#7f1d1d',
      textColor: 'text-rose-950',
      bgClass: 'bg-rose-100',
      badgeClass: 'bg-rose-200 text-rose-950 border-rose-400 font-bold',
      borderClass: 'border-rose-700',
      advisory: 'Emergency warning! Healthy people may experience adverse symptoms. Sensitive individuals should remain indoors.',
      healthImpact: 'Serious health impact across the entire civic population.',
    };
  }
}

export const DEFAULT_CITIES = [
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', latitude: 23.2599, longitude: 77.4126 },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', country: 'India', latitude: 22.7196, longitude: 75.8577 },
  { id: 'delhi', name: 'Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090 },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639 },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867 },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714 },
];

export function formatTime(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return isoString;
  }
}

export function formatHourOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}
