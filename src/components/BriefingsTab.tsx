'use client';

import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Download,
  Printer,
  Check,
  Languages,
  Sparkles,
  BookOpen,
  Info,
  Building,
  Users,
} from 'lucide-react';
import { AirQualityResponse, GeminiAnalysisResult } from '@/lib/types';
import { formatTime, getAQICategory } from '@/lib/aqi-utils';

interface BriefingsTabProps {
  airData: AirQualityResponse | null;
  analysis: GeminiAnalysisResult | null;
}

export const BriefingsTab: React.FC<BriefingsTabProps> = ({ airData, analysis }) => {
  const [reportType, setReportType] = useState<'internal' | 'citizen'>('internal');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [readingLevel, setReadingLevel] = useState<'standard' | 'simple'>('standard');
  const [copied, setCopied] = useState(false);

  if (!airData) {
    return <div className="p-8 text-center text-slate-500">No telemetry loaded.</div>;
  }

  const { current, location, source } = airData;
  const aqi = current.us_aqi;
  const aqiCat = getAQICategory(aqi);

  // Generate Report Content
  const generateInternalBriefing = () => {
    return `AIRSATHI CIVIC INTELLIGENCE INTERNAL BRIEFING
Document Ref: AS-INTERNAL-${location.name.toUpperCase()}-${Date.now().toString().slice(-6)}
Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Data Source: ${source.provider} (${source.model})
Telemetry Classification: ${source.classification === 'model_estimate' ? 'Model Estimate (CAMS Assimilated)' : 'Station Observed'}
Data Timestamp: ${formatTime(current.time)}
Target Municipality / Area: ${location.name} (Lat: ${location.latitude.toFixed(4)}°, Lon: ${location.longitude.toFixed(4)}°)

============================================================
1. EXECUTIVE SUMMARY
============================================================
The recorded US Air Quality Index for ${location.name} is ${aqi ?? 'N/A'} (${aqiCat.category}).
Fine particulate matter PM2.5 is measured at ${current.pm2_5 ?? 'N/A'} µg/m³ against the 24-hour National Ambient Air Quality Standard (NAAQS) benchmark of 60 µg/m³.
Coarse particulate matter PM10 is measured at ${current.pm10 ?? 'N/A'} µg/m³ (benchmark 100 µg/m³).
Nitrogen Dioxide (NO2) is ${current.nitrogen_dioxide ?? 'N/A'} µg/m³.
Carbon Monoxide (CO) is ${current.carbon_monoxide ?? 'N/A'} µg/m³.
Sulphur Dioxide (SO2) is ${current.sulphur_dioxide ?? 'N/A'} µg/m³.
Ozone (O3) is ${current.ozone ?? 'N/A'} µg/m³.

Analysis indicates primary respiratory stress is induced by ${
      (current.pm2_5 ?? 0) > (current.pm10 ?? 0) / 2 ? 'fine combustion particles (PM2.5)' : 'resuspended mechanical dust (PM10)'
    }.

============================================================
2. DATA INTEGRITY & SCIENTIFIC METHODOLOGY
============================================================
- Telemetry is retrieved directly from the Copernicus Atmosphere Monitoring Service (CAMS) numerical atmospheric simulation ensemble via Open-Meteo.
- Grid Cell Resolution: Approximately 0.1° to 0.25° (~11km to ~40km).
- Notice: Spatial variations within this municipal grid cell resolve to the same regional atmospheric baseline. Ward officers should note that localized street canyon hotspots may exceed this regional average.

============================================================
3. PRIORITY CIVIC INTERVENTIONS
============================================================
A. WARD LEVEL ACTIONS (MUNICIPAL):
   - Immediate mechanized sweeping and anti-smog misting along major traffic arteries.
   - Enforce green windbreak netting and wet dust suppression across active C&D sites.
   - Deploy municipal enforcement squads against open biomass, plastic, and leaf burning.

B. HOUSING SOCIETIES (RWA):
   - Direct security teams to enforce "Engine Shutdown / No Idling" at gate drop-offs.
   - Restrict driveway cleaning to wet mopping to prevent dust aerosolization.
   - Circulate advisory to elderly residents regarding morning walking hours.

C. SCHOOL ADMINISTRATION:
   - Reschedule vigorous early-morning outdoor sports to indoor halls.
   - Check status of asthmatic students and verify rescue medication availability.

============================================================
4. CIVIC HEALTH ADVISORY
============================================================
${aqiCat.advisory}
`;
  };

  const generateCitizenAdvisoryEn = (simple: boolean) => {
    if (simple) {
      return `AIRSATHI CITIZEN AIR QUALITY ADVISORY (EASY READ)
City: ${location.name}
Air Quality Today: ${aqiCat.category} (AQI: ${aqi ?? 'N/A'})
Last Checked: ${formatTime(current.time)}
Source: ${source.provider} (Atmosphere Model Estimate)

WHAT DOES THIS MEAN FOR YOU?
Air quality in ${location.name} is currently ${aqiCat.category}.
Small dust particles (PM2.5) are at ${current.pm2_5 ?? 'N/A'} µg/m³, which can irritate your throat and lungs.

HOW TO STAY SAFE TODAY:
1. Children & Schools:
   - Play indoors during early morning hours.
   - Drink plenty of water and wear a mask if playing near busy roads.

2. Elderly Citizens & Heart / Asthma Patients:
   - Avoid strenuous morning walks when pollution is trapped close to the ground.
   - Keep prescribed inhalers and medicines handy.

3. At Home & in Society:
   - Do NOT burn dry leaves, trash, or garden waste.
   - Turn off car and scooter engines while waiting at society gates.

Source Disclosure: This advisory is calculated from real public atmospheric model data from Open-Meteo.
`;
    }

    return `AIRSATHI PUBLIC HEALTH & CITIZEN ADVISORY
Location: ${location.name} | Date: ${new Date().toLocaleDateString('en-IN')}
Current Air Quality Index: ${aqi ?? 'N/A'} (${aqiCat.category})
PM2.5: ${current.pm2_5 ?? 'N/A'} µg/m³ | PM10: ${current.pm10 ?? 'N/A'} µg/m³
Data Provider: ${source.provider} (${source.model})
Telemetry Timestamp: ${formatTime(current.time)}

============================================================
AIR QUALITY EXPLANATION:
The ambient air in ${location.name} is categorized as "${aqiCat.category}".
${aqiCat.advisory}

PRECAUTIONS BY GROUP:
1. SENSITIVE INDIVIDUALS (Asthma, COPD, Cardiac Patients):
   - Limit prolonged outdoor physical exertion.
   - Wear a certified, well-fitted N95 mask when traveling along congested corridors.
   - Keep emergency bronchodilators accessible.

2. CHILDREN & SCHOOL GUIDANCE:
   - Early morning hours exhibit the highest particulate concentration due to thermal inversion.
   - Heavy aerobic exercises and outdoor athletics should be shifted to later in the day or indoors.

3. OLDER ADULTS:
   - Schedule daily walks after 09:30 AM when atmospheric boundary layers expand and solar heating aids dispersion.

COMMUNITY ACTION:
- Avoid all forms of open trash and leaf burning.
- Practice vehicle engine shutdown at school gates and housing society barriers.

Notice: Values represent CAMS regional atmospheric model estimations (~11-40km grid resolution).
`;
  };

  const generateCitizenAdvisoryHi = (simple: boolean) => {
    if (simple) {
      return `एयरसाथी नागरिक वायु गुणवत्ता परामर्श (सरल हिंदी)
शहर: ${location.name}
आज हवा की स्थिति: ${aqiCat.category} (AQI: ${aqi ?? 'N/A'})
समय: ${formatTime(current.time)}
स्रोत: ${source.provider} (मौसम व वायु मॉडल डेटा)

आपके और आपके परिवार के लिए इसका क्या मतलब है?
${location.name} में आज वायु गुणवत्ता "${aqiCat.category}" श्रेणी में है।
हवा में सूक्ष्म धूल कण (PM2.5) की मात्रा ${current.pm2_5 ?? 'N/A'} µg/m³ है, जो सांस नली में जलन पैदा कर सकती है।

सुरक्षा के सरल उपाय:
1. बच्चों और स्कूलों के लिए:
   - सुबह के समय बाहर भारी दौड़-भाग वाले खेल न खेलें।
   - व्यस्त सड़कों के पास जाते समय मास्क पहनें।

2. बुज़ुर्गों और दमा/हार्ट के मरीजों के लिए:
   - सुबह जल्दी टहलने (Morning Walk) से बचें, क्योंकि सुबह प्रदूषण जमीन के पास जमा रहता है।
   - अपनी दवाएं और इनहेलर हमेशा साथ रखें।

3. घर और कॉलोनी में क्या करें:
   - सूखे पत्ते, कूड़ा या कचरा बिल्कुल न जलाएं।
   - सोसाइटी गेट पर गाड़ी का इंजन चालू न छोड़ें।

डेटा पारदर्शिता: यह जानकारी Open-Meteo के सार्वजनिक वायु मॉडल डेटा पर आधारित है।
`;
    }

    return `एयरसाथी नागरिक स्वास्थ्य एवं वायु गुणवत्ता परामर्श (आधिकारिक हिंदी)
स्थान: ${location.name} | दिनांक: ${new Date().toLocaleDateString('en-IN')}
वर्तमान वायु गुणवत्ता सूचकांक (AQI): ${aqi ?? 'N/A'} (${aqiCat.category})
सूक्ष्म धूल कण (PM2.5): ${current.pm2_5 ?? 'N/A'} µg/m³ | धूल कण (PM10): ${current.pm10 ?? 'N/A'} µg/m³
डेटा प्रदाता: ${source.provider} (${source.model})
डेटा समय: ${formatTime(current.time)}

============================================================
वायु गुणवत्ता का विस्तृत विश्लेषण:
${location.name} में वर्तमान परिवेशीय वायु "${aqiCat.category}" श्रेणी में दर्ज की गई है।
${aqiCat.healthImpact}

वर्ग-वार एहतियाती दिशा-निर्देश:
1. संवेदनशील नागरिक (दमा, ब्रोंकाइटिस, हृदय रोग):
   - बाहर अधिक समय तक कठोर शारीरिक श्रम करने से बचें।
   - मुख्य सड़कों और यातायात चौराहों के समीप N95/N98 मास्क का प्रयोग करें।
   - चिकित्सक द्वारा निर्धारित आपातकालीन दवाएं उपलब्ध रखें।

2. बच्चों एवं शैक्षणिक संस्थानों के लिए निर्देश:
   - सुबह के समय तापमान में विपरीतता (Thermal Inversion) के कारण प्रदूषण नीचे जमा रहता है।
   - प्रातःकालीन खेलकूद और शारीरिक व्यायाम को इनडोर हॉल में स्थानांतरित करें।

3. वरिष्ठ नागरिकों के लिए मार्गदर्शन:
   - सुबह 09:30 बजे के बाद ही बाहर टहलें, जब धूप निकलने से वायु का फैलाव बेहतर होता है।

नागरिक दायित्व:
- आवासीय क्षेत्रों में बागवानी अपशिष्ट एवं कचरे को खुले में जलाने पर पूर्ण प्रतिबंध रखें।
- सोसायटियों और विद्यालयों के गेट पर वाहनों के अवांछित इंजन संचालन (Idling) को रोकें।

पारदर्शिता सूचना: यह डेटा CAMS वायुमंडलीय सिमुलेशन ग्रिड मॉडल (~11-40 किमी) पर आधारित वास्तविक सार्वजनिक डेटा है।
`;
  };

  const getActiveText = () => {
    if (reportType === 'internal') {
      return generateInternalBriefing();
    } else {
      if (language === 'hi') {
        return generateCitizenAdvisoryHi(readingLevel === 'simple');
      } else {
        return generateCitizenAdvisoryEn(readingLevel === 'simple');
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = getActiveText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AirSathi_${reportType}_${location.name}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const text = getActiveText();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AirSathi Civic Briefing - ${location.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
            .header { border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 24px; }
            .title { font-size: 20px; font-weight: bold; color: #059669; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">AirSathi – Civic Air Intelligence</div>
            <div style="font-size: 12px; color: #64748b;">From live air quality data to local action. PromptWars MVP</div>
          </div>
          <pre>${text}</pre>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Civic Briefing & Citizen Advisory Generator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generate technical municipal briefings and plain-language citizen advisories
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download TXT</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / HTML</span>
          </button>
        </div>
      </div>

      {/* Selector Options */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Report Type Selector */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Document Type:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setReportType('internal')}
              className={`px-3 py-1 rounded font-semibold transition-all flex items-center gap-1.5 ${
                reportType === 'internal'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Internal Civic Briefing
            </button>
            <button
              onClick={() => setReportType('citizen')}
              className={`px-3 py-1 rounded font-semibold transition-all flex items-center gap-1.5 ${
                reportType === 'citizen'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Citizen Advisory
            </button>
          </div>
        </div>

        {/* Citizen Advisory Customizations */}
        {reportType === 'citizen' && (
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded font-semibold ${
                    language === 'en' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-1 rounded font-semibold ${
                    language === 'hi' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
              </div>
            </div>

            {/* Reading Level */}
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setReadingLevel('standard')}
                  className={`px-2.5 py-1 rounded font-semibold ${
                    readingLevel === 'standard' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setReadingLevel('simple')}
                  className={`px-2.5 py-1 rounded font-semibold ${
                    readingLevel === 'simple' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Simple Read
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Briefing Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>
            Preview: {reportType === 'internal' ? 'Internal Civic Technical Briefing' : `Citizen Public Advisory (${language.toUpperCase()})`}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Source: {source.provider} • Real Telemetry Backed
          </span>
        </div>

        <div className="p-6 font-mono text-xs text-slate-800 bg-white overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
          {getActiveText()}
        </div>
      </div>
    </div>
  );
};
