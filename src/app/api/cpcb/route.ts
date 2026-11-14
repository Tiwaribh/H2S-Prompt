import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * CPCB / Central Pollution Control Board (Government of India) National AQI Integration
 * Dataset: https://www.data.gov.in/catalog/real-time-air-quality-index
 *
 * Implements the official PromptWars secondary integration requirement:
 * "If API credentials are required, implement an optional integration using: DATA_GOV_IN_API_KEY.
 *  Do not hardcode credentials. If credentials are unavailable, keep the CPCB integration
 *  clearly marked as requiring configuration and continue with Open-Meteo."
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city') || 'Bhopal';
  const apiKey = process.env.DATA_GOV_IN_API_KEY;

  // 1. If API key is not configured, disclose clearly without failing
  if (!apiKey || apiKey.trim().length === 0) {
    return NextResponse.json({
      provider: 'CPCB / Central Pollution Control Board (Data.gov.in)',
      status: 'requires_configuration',
      configured: false,
      classification: 'physical_monitoring_station',
      datasetUrl: 'https://www.data.gov.in/catalog/real-time-air-quality-index',
      message:
        'CPCB National AQI dataset requires DATA_GOV_IN_API_KEY. AirSathi continues with primary Open-Meteo CAMS atmospheric telemetry.',
      primaryFallbackActive: true,
      activeProvider: 'Open-Meteo Air Quality API',
    });
  }

  // 2. If API key is configured, query the real Government of India public dataset
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const dataGovUrl = `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=${encodeURIComponent(
      apiKey.trim()
    )}&format=json&filters[city]=${encodeURIComponent(city.trim())}&limit=10`;

    const res = await fetch(dataGovUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 900 }, // 15-min cache
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        {
          provider: 'CPCB / Central Pollution Control Board',
          status: 'unavailable',
          configured: true,
          error: `Data.gov.in API returned HTTP ${res.status}: ${res.statusText}`,
          primaryFallbackActive: true,
        },
        { status: res.status }
      );
    }

    const json = await res.json();
    return NextResponse.json({
      provider: 'CPCB / Central Pollution Control Board',
      status: 'active',
      configured: true,
      classification: 'physical_monitoring_station',
      city,
      records: json.records || [],
      totalRecords: json.total || 0,
      retrievedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        provider: 'CPCB / Central Pollution Control Board',
        status: 'error',
        configured: true,
        error: 'Failed to retrieve CPCB monitoring station records from Data.gov.in',
        details: err.message,
        primaryFallbackActive: true,
      },
      { status: 502 }
    );
  }
}
