import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAQ_API_KEY;
  const searchParams = request.nextUrl.searchParams;
  const latStr = searchParams.get('lat') || '28.6139';
  const lonStr = searchParams.get('lon') || '77.2090';

  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      status: 'requires_api_key',
      provider: 'OpenAQ v3 API',
      portalUrl: 'https://api.openaq.org/v3',
      message:
        'OpenAQ integration is optional. Configure OPENAQ_API_KEY to fetch station measurements from international and civic partner networks.',
    });
  }

  try {
    const res = await fetch(
      `https://api.openaq.org/v3/locations?coordinates=${latStr},${lonStr}&radius=25000&limit=10`,
      {
        headers: {
          'X-API-Key': apiKey,
          'Accept': 'application/json',
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        {
          configured: true,
          status: 'upstream_error',
          provider: 'OpenAQ',
          error: `OpenAQ returned HTTP ${res.status}`,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      configured: true,
      status: 'active',
      provider: 'OpenAQ v3 Network',
      classification: 'station_observed',
      results: data.results || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { configured: true, status: 'error', error: err.message },
      { status: 502 }
    );
  }
}
