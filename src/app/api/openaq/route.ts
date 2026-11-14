import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * OpenAQ API v3 Integration (Optional Research Dataset)
 * Documentation: https://api.openaq.org/v3
 *
 * Implements the PromptWars optional integration requirement:
 * "Investigate OpenAQ API v3: https://api.openaq.org/v3. Use OPENAQ_API_KEY through environment variables.
 *  This integration is optional and must not delay the MVP."
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latStr = searchParams.get('latitude') || '23.2599';
  const lonStr = searchParams.get('longitude') || '77.4126';
  const apiKey = process.env.OPENAQ_API_KEY;

  // 1. If API key is omitted, mark as optional / requires_configuration
  if (!apiKey || apiKey.trim().length === 0) {
    return NextResponse.json({
      provider: 'OpenAQ API v3 Global Research Network',
      status: 'requires_configuration',
      configured: false,
      classification: 'global_sensor_network',
      documentationUrl: 'https://api.openaq.org/v3',
      message:
        'OpenAQ v3 integration requires OPENAQ_API_KEY. AirSathi continues with primary Open-Meteo CAMS atmospheric telemetry.',
      primaryFallbackActive: true,
      activeProvider: 'Open-Meteo Air Quality API',
    });
  }

  // 2. If API key is configured, query OpenAQ v3 locations
  try {
    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lonStr);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const openaqUrl = `https://api.openaq.org/v3/locations?coordinates=${latitude},${longitude}&radius=25000&limit=5`;

    const res = await fetch(openaqUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'X-API-Key': apiKey.trim(),
      },
      next: { revalidate: 1800 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        {
          provider: 'OpenAQ API v3',
          status: 'unavailable',
          configured: true,
          error: `OpenAQ API returned HTTP ${res.status}: ${res.statusText}`,
          primaryFallbackActive: true,
        },
        { status: res.status }
      );
    }

    const json = await res.json();
    return NextResponse.json({
      provider: 'OpenAQ API v3',
      status: 'active',
      configured: true,
      classification: 'global_sensor_network',
      results: json.results || [],
      retrievedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        provider: 'OpenAQ API v3',
        status: 'error',
        configured: true,
        error: 'Failed to retrieve OpenAQ sensor network data',
        details: err.message,
        primaryFallbackActive: true,
      },
      { status: 502 }
    );
  }
}
