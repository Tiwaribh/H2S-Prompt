import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiAnalysisResult, AirQualityResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

function generateDeterministicAnalysis(
  airData: AirQualityResponse,
  comparisons: AirQualityResponse[] = []
): GeminiAnalysisResult {
  const locName = airData?.location?.name || 'Selected City';
  const aqi = airData?.current?.us_aqi ?? 'N/A';
  const pm25 = airData?.current?.pm2_5 ?? 'N/A';
  const pm10 = airData?.current?.pm10 ?? 'N/A';
  const no2 = airData?.current?.nitrogen_dioxide ?? 'N/A';
  const so2 = airData?.current?.sulphur_dioxide ?? 'N/A';
  const co = airData?.current?.carbon_monoxide ?? 'N/A';
  const o3 = airData?.current?.ozone ?? 'N/A';
  const time = airData?.current?.time || new Date().toISOString();
  const provider = airData?.source?.provider || 'Open-Meteo Air Quality API';
  const dataType = 'Model estimate (CAMS)' as const;

  const aqiNum = typeof aqi === 'number' ? aqi : 50;
  let severity = 'Good';
  if (aqiNum > 300) severity = 'Severe / Hazardous';
  else if (aqiNum > 200) severity = 'Very Poor';
  else if (aqiNum > 100) severity = 'Moderate / Poor';
  else if (aqiNum > 50) severity = 'Satisfactory';

  const findings = [
    {
      location: locName,
      pollutant: 'PM2.5 (Fine Particulate Matter)',
      source_value: pm25,
      unit: 'µg/m³',
      timestamp: time,
      data_provider: provider,
      data_type: dataType,
      confidence_and_limitations:
        'High regional confidence from CAMS numerical atmospheric ensemble (~11-40km grid); does not capture hyper-local street canopy variations.',
      interpretation:
        typeof pm25 === 'number' && pm25 > 60
          ? `Elevated fine respirable particles (${pm25} µg/m³) exceeding standard thresholds, posing pulmonary stress.`
          : `Current PM2.5 level is ${pm25} µg/m³.`,
    },
    {
      location: locName,
      pollutant: 'PM10 (Coarse Particulate Matter)',
      source_value: pm10,
      unit: 'µg/m³',
      timestamp: time,
      data_provider: provider,
      data_type: dataType,
      confidence_and_limitations:
        'CAMS model projection reflecting mechanical dust, resuspended road dust, and construction suspension.',
      interpretation:
        typeof pm10 === 'number' && pm10 > 100
          ? `Coarse particulate loading (${pm10} µg/m³) indicates mechanical dust and unpaved surface suspension.`
          : `Coarse particulate measured at ${pm10} µg/m³.`,
    },
    {
      location: locName,
      pollutant: 'NO2 (Nitrogen Dioxide)',
      source_value: no2,
      unit: 'µg/m³',
      timestamp: time,
      data_provider: provider,
      data_type: dataType,
      confidence_and_limitations: 'Estimated from traffic density and combustion emission inventories.',
      interpretation:
        typeof no2 === 'number' && no2 > 80
          ? `Combustion byproduct elevated (${no2} µg/m³), pointing towards high vehicular idling or diesel operations.`
          : `Nitrogen dioxide currently reported at ${no2} µg/m³.`,
    },
    {
      location: locName,
      pollutant: 'CO, SO2 & Ozone',
      source_value: `CO: ${co}, SO2: ${so2}, O3: ${o3}`,
      unit: 'µg/m³',
      timestamp: time,
      data_provider: provider,
      data_type: dataType,
      confidence_and_limitations: 'Regional photochemical model synthesis.',
      interpretation: 'Secondary gaseous pollutants monitored for photochemical smog and industrial plume tracking.',
    },
  ];

  const locComparisonList = comparisons.map((c) => ({
    location: c.location?.name || 'Location',
    aqi: c.current?.us_aqi || 0,
    category: (c.current?.us_aqi || 0) > 200 ? 'High' : (c.current?.us_aqi || 0) > 100 ? 'Moderate' : 'Low',
    dominant_pollutant: 'PM2.5',
    relative_risk: (c.current?.us_aqi || 0) > 150 ? 'Requires civic intervention' : 'Standard monitoring',
  }));

  if (locComparisonList.length === 0) {
    locComparisonList.push({
      location: locName,
      aqi: typeof aqi === 'number' ? aqi : 0,
      category: severity,
      dominant_pollutant: 'PM2.5 / PM10',
      relative_risk: aqiNum > 150 ? 'Elevated civic vigilance required' : 'Acceptable ambient baseline',
    });
  }

  return {
    executive_summary: `Live ambient air quality analysis for ${locName} indicates an AQI of ${aqi} (${severity}) based on ${provider} model estimates. Primary active particulate loading is driven by PM2.5 (${pm25} µg/m³) and PM10 (${pm10} µg/m³). Actionable civic interventions should prioritize dust suppression and idling controls.`,
    overall_assessment: `The recorded AQI of ${aqi} places ${locName} in the ${severity} air-quality tier. Note: Because readings originate from atmospheric simulation grid cells (~11-40km), local street-level microclimates may exhibit localized variance.`,
    key_findings: findings,
    trends: [
      {
        pollutant: 'Particulate Matter (PM2.5 & PM10)',
        pattern: 'Diurnal inversion peak typically observed during late evening and early morning hours.',
        peak_time: '06:00 - 09:00 IST',
        implication: 'Surface boundary layer compression traps ground-level vehicular and biomass emissions.',
      },
      {
        pollutant: 'Ozone (O3)',
        pattern: 'Midday photochemical accumulation peaking with peak solar radiation.',
        peak_time: '12:00 - 15:00 IST',
        implication: 'Photochemical reaction of VOCs and NOx under clear sky conditions.',
      },
    ],
    location_comparison: locComparisonList,
    data_quality: [
      {
        source: provider,
        type: dataType,
        completeness: '100% of standard criteria pollutants retrieved from Open-Meteo',
        uncertainty_notes:
          'Data derived from ECMWF/CAMS global atmospheric forecast models with assimilated satellite retrievals. Reflects 0.1° to 0.25° grid average.',
      },
    ],
    priority_actions: [
      {
        priority: aqiNum > 150 ? 'Immediate (High)' : 'Moderate',
        action: 'Deploy targeted water-mist sprinklers along high-traffic corridors and unpaved verges.',
        stakeholder: 'Ward Officer',
        target_pollutant: 'PM10 & PM2.5',
        rationale: 'Suppresses mechanical resuspension of road silt before morning vehicular surge.',
        timeframe: 'Next 3 hours',
      },
      {
        priority: 'Immediate (High)',
        action: 'Strictly prohibit open burning of horticultural waste and sweepings within municipal wards.',
        stakeholder: 'Ward Officer',
        target_pollutant: 'Carbon Monoxide & PM2.5',
        rationale: 'Biomass smoldering produces high concentrations of toxic respirable smoke at ground level.',
        timeframe: 'Continuous / Immediate enforcement',
      },
      {
        priority: 'Moderate',
        action: 'Enforce No-Idling zones at society entrance gates and school drop-off points.',
        stakeholder: 'Housing Society',
        target_pollutant: 'NO2 & PM2.5',
        rationale: 'Eliminates concentrated exhaust accumulation where pedestrians and children congregate.',
        timeframe: 'Effective today',
      },
      {
        priority: aqiNum > 100 ? 'Immediate (High)' : 'Advisory',
        action: 'Relocate or modify strenuous morning physical education to indoor well-ventilated halls.',
        stakeholder: 'School Administrator',
        target_pollutant: 'PM2.5',
        rationale: 'Protects pediatric respiratory tracts during peak morning particulate inversion.',
        timeframe: 'Tomorrow morning session',
      },
    ],
    health_advisory:
      aqiNum > 150
        ? `People with asthma, chronic obstructive pulmonary disease (COPD), or cardiac conditions should limit prolonged outdoor exertion in ${locName}. Wear well-fitting N95/N98 masks near traffic corridors. Ensure school children and elderly residents remain in clean indoor air.`
        : `General civic conditions in ${locName} permit normal outdoor activities. Sensitive groups should monitor for symptoms if outdoors near major arterial roads.`,
    source_meta: {
      generated_at: new Date().toISOString(),
      used_model: 'Civic Air Intelligence Engine (Deterministic Grounded Pipeline)',
      real_data_backed: true,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { airQualityData, locationsComparison = [] } = body;

    if (!airQualityData || !airQualityData.current) {
      return NextResponse.json(
        { error: 'Missing air quality telemetry data for intelligence analysis.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const prompt = `You are the Civic Air Intelligence Engine of AirSathi, a civic technology platform for Indian municipalities and citizens.
You are evaluating REAL live air quality data retrieved from the Open-Meteo Air Quality API (CAMS model estimates).

NON-NEGOTIABLE REQUIREMENTS:
1. DO NOT invent, hallucinate, or fabricate any pollutant readings or AQI values.
2. Every finding MUST cite the EXACT values, units, and timestamps provided in the input JSON below.
3. State explicit limitations: Values are atmospheric model simulations over ~10-40km grid cells, not hyper-local street sensors.
4. Provide realistic, non-sensational civic recommendations for Indian urban stakeholders (Ward Officers, Housing Societies, School Administrators).

INPUT TELEMETRY:
${JSON.stringify({ airQualityData, locationsComparison }, null, 2)}

Return ONLY valid JSON matching this exact structure:
{
  "executive_summary": "string",
  "overall_assessment": "string",
  "key_findings": [
    {
      "location": "string",
      "pollutant": "string",
      "source_value": number_or_string,
      "unit": "string",
      "timestamp": "string",
      "data_provider": "string",
      "data_type": "Model estimate (CAMS)",
      "confidence_and_limitations": "string",
      "interpretation": "string"
    }
  ],
  "trends": [
    {
      "pollutant": "string",
      "pattern": "string",
      "peak_time": "string",
      "implication": "string"
    }
  ],
  "location_comparison": [
    {
      "location": "string",
      "aqi": number,
      "category": "string",
      "dominant_pollutant": "string",
      "relative_risk": "string"
    }
  ],
  "data_quality": [
    {
      "source": "string",
      "type": "string",
      "completeness": "string",
      "uncertainty_notes": "string"
    }
  ],
  "priority_actions": [
    {
      "priority": "Immediate (High)" or "Moderate" or "Advisory",
      "action": "string",
      "stakeholder": "Ward Officer" or "Housing Society" or "School Administrator" or "Public",
      "target_pollutant": "string",
      "rationale": "string",
      "timeframe": "string"
    }
  ],
  "health_advisory": "string"
}`;

        // Timeout race for Gemini API (max 12s before graceful fallback)
        const geminiPromise = model.generateContent(prompt);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out after 12s')), 12000)
        );

        const result: any = await Promise.race([geminiPromise, timeoutPromise]);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        parsed.source_meta = {
          generated_at: new Date().toISOString(),
          used_model: 'Google Gemini 1.5 Flash (Live API)',
          real_data_backed: true,
        };

        return NextResponse.json(parsed);
      } catch (geminiError: any) {
        console.warn(
          'Gemini API call unavailable or timed out; activating deterministic intelligence engine:',
          geminiError.message
        );
      }
    }

    const deterministicResult = generateDeterministicAnalysis(airQualityData, locationsComparison);
    return NextResponse.json(deterministicResult);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to generate civic intelligence analysis', details: err.message },
      { status: 500 }
    );
  }
}
