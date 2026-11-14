import { ReportSnapshot, ComparisonDelta, CurrentPollutants, StakeholderRole, StakeholderRecommendation } from './types';

const SNAPSHOTS_KEY = 'airsathi_snapshots_v1';
const LOCATIONS_KEY = 'airsathi_locations_v1';

export function saveSnapshotToStorage(snapshot: ReportSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSnapshotsFromStorage();
    const updated = [snapshot, ...existing.filter((s) => s.id !== snapshot.id)].slice(0, 30);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save snapshot to localStorage', e);
  }
}

export function getSnapshotsFromStorage(): ReportSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SNAPSHOTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to read snapshots from localStorage', e);
    return [];
  }
}

export function deleteSnapshotFromStorage(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSnapshotsFromStorage();
    const updated = existing.filter((s) => s.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete snapshot', e);
  }
}

export function compareSnapshots(
  current: CurrentPollutants,
  previous: CurrentPollutants,
  providerMatch = true
): ComparisonDelta[] {
  const metrics: { key: keyof CurrentPollutants; label: string; unit: string }[] = [
    { key: 'us_aqi', label: 'US AQI (Index)', unit: 'AQI' },
    { key: 'pm2_5', label: 'PM2.5 (Fine Particulates)', unit: 'µg/m³' },
    { key: 'pm10', label: 'PM10 (Coarse Dust)', unit: 'µg/m³' },
    { key: 'nitrogen_dioxide', label: 'NO2 (Nitrogen Dioxide)', unit: 'µg/m³' },
    { key: 'sulphur_dioxide', label: 'SO2 (Sulphur Dioxide)', unit: 'µg/m³' },
    { key: 'carbon_monoxide', label: 'CO (Carbon Monoxide)', unit: 'µg/m³' },
    { key: 'ozone', label: 'O3 (Ozone)', unit: 'µg/m³' },
  ];

  return metrics.map(({ key, label, unit }) => {
    const curVal = typeof current[key] === 'number' ? (current[key] as number) : null;
    const prevVal = typeof previous[key] === 'number' ? (previous[key] as number) : null;

    if (curVal === null || prevVal === null) {
      return {
        metric: label,
        currentVal: curVal,
        prevVal: prevVal,
        delta: null,
        percentChange: null,
        trend: 'unavailable',
        unit,
        compatible: providerMatch,
        note: 'Metric missing in one of the compared snapshots.',
      };
    }

    const delta = parseFloat((curVal - prevVal).toFixed(2));
    const percentChange = prevVal !== 0 ? parseFloat(((delta / prevVal) * 100).toFixed(1)) : 0;

    let trend: 'increased' | 'decreased' | 'unchanged' = 'unchanged';
    if (delta > 0.5) trend = 'increased';
    else if (delta < -0.5) trend = 'decreased';

    return {
      metric: label,
      currentVal: curVal,
      prevVal: prevVal,
      delta,
      percentChange,
      trend,
      unit,
      compatible: providerMatch,
    };
  });
}

export function getRecommendationsForRole(
  role: StakeholderRole,
  current: CurrentPollutants,
  locationName: string
): StakeholderRecommendation[] {
  const aqi = current.us_aqi ?? 0;
  const pm25 = current.pm2_5 ?? 0;
  const pm10 = current.pm10 ?? 0;
  const no2 = current.nitrogen_dioxide ?? 0;

  if (role === 'Ward Officer') {
    return [
      {
        id: 'ward-1',
        priority: pm10 > 120 || aqi > 200 ? 'High' : 'Medium',
        suggested_action: 'Deploy mechanized sweeping trucks and anti-smog water sprinklers along key transit corridors.',
        responsible_stakeholder: 'Ward Officer',
        reason: 'Suppress surface dust resuspension before morning and evening rush hours.',
        supporting_data: `Current PM10 level is ${pm10} µg/m³ (AQI: ${aqi}). Target: reduce mechanical dust suspension by 25%.`,
        suggested_timeframe: 'Immediate deployment within 2-4 hours',
      },
      {
        id: 'ward-2',
        priority: 'High',
        suggested_action: 'Conduct spot inspections of active construction and demolition (C&D) sites for mandatory green windbreak netting and water misting.',
        responsible_stakeholder: 'Ward Officer',
        reason: 'Construction debris is a prominent contributor to localized coarse particulate spikes.',
        supporting_data: `Coarse particulate index PM10 is currently at ${pm10} µg/m³ across the ${locationName} sector.`,
        suggested_timeframe: 'Same-day inspection cycle',
      },
      {
        id: 'ward-3',
        priority: 'High',
        suggested_action: 'Institute night vigilance patrols against open biomass and municipal solid waste (MSW) burning.',
        responsible_stakeholder: 'Ward Officer',
        reason: 'Biomass burning injects high fractions of black carbon and toxic carbon monoxide at ground level during thermal inversions.',
        supporting_data: `Carbon Monoxide reading is ${current.carbon_monoxide ?? 'N/A'} µg/m³.`,
        suggested_timeframe: '20:00 to 06:00 IST daily patrols',
      },
      {
        id: 'ward-4',
        priority: 'Medium',
        suggested_action: 'Coordinate with traffic police to manage vehicular bottlenecks and reduce intersection wait cycles.',
        responsible_stakeholder: 'Ward Officer',
        reason: 'Vehicular idling leads to localized nitrogen dioxide and ultrafine particle hotspots.',
        supporting_data: `Nitrogen dioxide NO2 level stands at ${no2} µg/m³.`,
        suggested_timeframe: 'Peak traffic hours (08:30-11:00 & 17:30-20:30)',
      },
    ];
  } else if (role === 'Housing Society') {
    return [
      {
        id: 'society-1',
        priority: 'High',
        suggested_action: 'Strictly prohibit leaves and garden waste burning inside or around society perimeters.',
        responsible_stakeholder: 'Housing Society',
        reason: 'Horticultural smoke immediately affects ground floor flats and walking tracks.',
        supporting_data: `Ambient PM2.5 in ${locationName} is ${pm25} µg/m³, which directly penetrates indoor spaces.`,
        suggested_timeframe: 'Immediate circular to maintenance and housekeeping',
      },
      {
        id: 'society-2',
        priority: aqi > 150 ? 'High' : 'Medium',
        suggested_action: 'Enforce mandatory engine shutdown ("No Idling") for visitor taxis, school vans, and delivery vehicles at gates.',
        responsible_stakeholder: 'Housing Society',
        reason: 'Exhaust from idling vehicles accumulates in gate corridors and children play zones.',
        supporting_data: `NO2 level is ${no2} µg/m³; idling vehicles contribute heavily to residential nitrogen oxide spikes.`,
        suggested_timeframe: 'Put up gate signage today',
      },
      {
        id: 'society-3',
        priority: pm10 > 100 ? 'High' : 'Medium',
        suggested_action: 'Implement wet mopping for common driveways and podium parking instead of dry broom sweeping.',
        responsible_stakeholder: 'Housing Society',
        reason: 'Dry brooming aerosolizes settled particulate matter back into breathing air.',
        supporting_data: `PM10 is ${pm10} µg/m³ in this region.`,
        suggested_timeframe: 'Daily housekeeping standard',
      },
      {
        id: 'society-4',
        priority: aqi > 180 ? 'High' : 'Low',
        suggested_action: 'Broadcast civic air advisories to society residents recommending N95 masks for morning walks.',
        responsible_stakeholder: 'Housing Society',
        reason: 'Morning hours coincide with thermal boundary compression and highest particulate density.',
        supporting_data: `AQI is currently ${aqi} (${aqi > 200 ? 'Very Poor' : aqi > 100 ? 'Moderate/Unhealthy' : 'Acceptable'}).`,
        suggested_timeframe: 'Send WhatsApp / Notice board update by 18:00 IST',
      },
    ];
  } else {
    // School Administrator
    return [
      {
        id: 'school-1',
        priority: aqi > 150 || pm25 > 60 ? 'High' : 'Medium',
        suggested_action: 'Shift morning physical education (P.E.), assemblies, and sports training indoors or reschedule to late morning.',
        responsible_stakeholder: 'School Administrator',
        reason: 'Children have higher respiratory rates per body weight; heavy outdoor aerobic exertion in polluted air leads to deep alveolar deposition.',
        supporting_data: `Current PM2.5 is ${pm25} µg/m³; AQI is ${aqi}. Early morning hours experience the poorest dispersion.`,
        suggested_timeframe: 'Next school day morning schedule',
      },
      {
        id: 'school-2',
        priority: 'High',
        suggested_action: 'Issue health advisory to parents of children with asthma, allergies, or chronic bronchitis.',
        responsible_stakeholder: 'School Administrator',
        reason: 'Asthmatic students need rescue inhalers readily accessible with the school infirmary nurse alerted.',
        supporting_data: `Current overall air quality index in ${locationName} is ${aqi}.`,
        suggested_timeframe: 'Direct notification to parents via school app',
      },
      {
        id: 'school-3',
        priority: 'Medium',
        suggested_action: 'Designate bus and carpool pick-up / drop-off zones away from primary classroom windows and turn off bus engines immediately upon arrival.',
        responsible_stakeholder: 'School Administrator',
        reason: 'Diesel bus emissions contain fine particulates and carcinogenic aromatic hydrocarbons.',
        supporting_data: `Current ambient NO2 is ${no2} µg/m³ and PM2.5 is ${pm25} µg/m³.`,
        suggested_timeframe: 'Transport team directive today',
      },
      {
        id: 'school-4',
        priority: 'Medium',
        suggested_action: 'Inspect and clean indoor classroom air filters and ensure cross-ventilation during lowest pollution hours.',
        responsible_stakeholder: 'School Administrator',
        reason: 'Well-maintained filtration reduces indoor particulate burden significantly.',
        supporting_data: `External ambient baseline PM2.5 is ${pm25} µg/m³.`,
        suggested_timeframe: 'Weekly facility maintenance check',
      },
    ];
  }
}
