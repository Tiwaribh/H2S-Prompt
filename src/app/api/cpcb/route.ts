import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city') || 'Delhi';

  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      status: 'requires_api_key',
      provider: 'Central Pollution Control Board (CPCB) / Data.gov.in',
      dataset: 'Real-time Air Quality Index (National AQI)',
      portalUrl: 'https://www.data.gov.in/catalog/real-time-air-quality-index',
      message:
        'CPCB physical monitoring-station API is currently not configured. Set DATA_GOV_IN_API_KEY in environment variables to enable official station telemetry. The application is operating on Open-Meteo CAMS model estimates.',
      stationCount: 0,
      stations: [],
    });
  }

  try {
    const resourceUrl = `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=${encodeURIComponent(
      apiKey
    )}&format=json&offset=0&limit=50&filters[city]=${encodeURIComponent(city)}`;

    const res = await fetch(resourceUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          configured: true,
          status: 'upstream_error',
          provider: 'CPCB / Data.gov.in',
          error: `Data.gov.in API returned HTTP ${res.status}`,
          stations: [],
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      configured: true,
      status: 'active',
      provider: 'Central Pollution Control Board (CPCB) Official Monitoring Stations',
      classification: 'station_observed',
      city,
      records: data.records || [],
      total: data.total || 0,
      updated_date: data.updated_date,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        configured: true,
        status: 'error',
        provider: 'CPCB / Data.gov.in',
        error: err.message,
      },
      { status: 502 }
    );
  }
}
