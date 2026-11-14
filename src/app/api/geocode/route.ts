import { NextRequest, NextResponse } from 'next/server';
import { CityLocation } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawQuery = searchParams.get('q');

  if (!rawQuery || rawQuery.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Sanitize and cap query length
  const query = rawQuery.trim().slice(0, 100);

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=10&language=en&format=json`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Geocoding service unavailable', results: [] },
        { status: res.status }
      );
    }

    const data = await res.json();
    const results: CityLocation[] = (data.results || []).map((item: any) => ({
      id: `${item.latitude}_${item.longitude}`,
      name: item.name,
      state: item.admin1 || item.admin2 || '',
      country: item.country || 'India',
      latitude: item.latitude,
      longitude: item.longitude,
      elevation: item.elevation,
    }));

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    return NextResponse.json(
      {
        error: isTimeout ? 'Geocoding request timed out' : 'Geocoding lookup failed',
        details: err.message,
        results: [],
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
