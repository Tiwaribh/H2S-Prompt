import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latStr = searchParams.get('latitude') || searchParams.get('lat');
  const lonStr = searchParams.get('longitude') || searchParams.get('lon');
  const cityName = searchParams.get('name') || 'Selected Location';

  if (!latStr || !lonStr) {
    return NextResponse.json(
      { error: 'Missing latitude or longitude parameter.' },
      { status: 400 }
    );
  }

  const latitude = parseFloat(latStr);
  const longitude = parseFloat(lonStr);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'Invalid numeric coordinates provided.' },
      { status: 400 }
    );
  }

  const openMeteoUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&hourly=pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone,us_aqi,european_aqi&past_days=2&forecast_days=3&timezone=Asia%2FKolkata`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(openMeteoUrl, {
      signal: controller.signal,
      next: { revalidate: 300 }, // 5 min cache
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          error: `Open-Meteo Air Quality API returned HTTP ${res.status}: ${res.statusText}`,
          details: errText,
          provider: 'Open-Meteo / Copernicus Atmosphere Monitoring Service (CAMS)',
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    const formattedResponse = {
      location: {
        id: `${latitude.toFixed(4)}_${longitude.toFixed(4)}`,
        name: cityName,
        latitude: data.latitude ?? latitude,
        longitude: data.longitude ?? longitude,
        elevation: data.elevation ?? 0,
        timezone: data.timezone,
        timezone_abbreviation: data.timezone_abbreviation,
      },
      current: {
        time: data.current?.time ?? new Date().toISOString(),
        pm2_5: data.current?.pm2_5 ?? null,
        pm10: data.current?.pm10 ?? null,
        carbon_monoxide: data.current?.carbon_monoxide ?? null,
        nitrogen_dioxide: data.current?.nitrogen_dioxide ?? null,
        sulphur_dioxide: data.current?.sulphur_dioxide ?? null,
        ozone: data.current?.ozone ?? null,
        us_aqi: data.current?.us_aqi ?? null,
        european_aqi: data.current?.european_aqi ?? null,
      },
      hourly: {
        time: data.hourly?.time ?? [],
        pm2_5: data.hourly?.pm2_5 ?? [],
        pm10: data.hourly?.pm10 ?? [],
        carbon_monoxide: data.hourly?.carbon_monoxide ?? [],
        nitrogen_dioxide: data.hourly?.nitrogen_dioxide ?? [],
        sulphur_dioxide: data.hourly?.sulphur_dioxide ?? [],
        ozone: data.hourly?.ozone ?? [],
        us_aqi: data.hourly?.us_aqi ?? [],
        european_aqi: data.hourly?.european_aqi ?? [],
      },
      units: data.current_units ?? {
        pm2_5: 'µg/m³',
        pm10: 'µg/m³',
        carbon_monoxide: 'µg/m³',
        nitrogen_dioxide: 'µg/m³',
        sulphur_dioxide: 'µg/m³',
        ozone: 'µg/m³',
        us_aqi: 'AQI index',
        european_aqi: 'AQI index',
      },
      source: {
        provider: 'Open-Meteo Air Quality API',
        model: 'Copernicus Atmosphere Monitoring Service (CAMS) Global & Regional Ensemble',
        classification: 'model_estimate' as const,
        description:
          'Values are CAMS-based atmospheric numerical model estimates, not direct physical monitoring-station measurements.',
        retrievedAt: new Date().toISOString(),
        gridCell: `Lat ${data.latitude}° / Lon ${data.longitude}° (resolution ~10-40km)`,
      },
      gridDisclosure:
        'Model grid cell resolution is approximately 11km to 40km. Micro-local or ward-level variations within the same grid cell resolve to identical modelled baseline values.',
    };

    return NextResponse.json(formattedResponse);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve real-time air quality data from Open-Meteo.',
        details: err.message || String(err),
        provider: 'Open-Meteo',
      },
      { status: 502 }
    );
  }
}
