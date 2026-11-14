import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=10&language=en&format=json`;

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Geocoding service unavailable', results: [] },
        { status: res.status }
      );
    }

    const data = await res.json();
    const results = (data.results || []).map((item: any) => ({
      id: `${item.latitude}_${item.longitude}`,
      name: item.name,
      state: item.admin1 || item.admin2 || '',
      country: item.country || '',
      country_code: item.country_code,
      latitude: item.latitude,
      longitude: item.longitude,
      elevation: item.elevation,
    }));

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Geocoding lookup failed', details: err.message, results: [] },
      { status: 500 }
    );
  }
}
