CREATE OR REPLACE FUNCTION public.detran_jsonb_point_4674(payload jsonb)
RETURNS geometry(Point, 4674)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  lat_text text;
  lon_text text;
  parsed geometry;
BEGIN
  IF payload IS NULL THEN RETURN NULL; END IF;
  lat_text := coalesce(payload->>'latitude', payload->>'lat');
  lon_text := coalesce(payload->>'longitude', payload->>'lon', payload->>'lng');
  IF lat_text ~ '^-?[0-9]+(\.[0-9]+)?$' AND lon_text ~ '^-?[0-9]+(\.[0-9]+)?$' THEN
    RETURN st_setsrid(st_makepoint(lon_text::double precision, lat_text::double precision), 4674);
  END IF;
  BEGIN
    parsed := st_setsrid(st_geomfromgeojson(payload::text), 4674);
    IF geometrytype(parsed) = 'POINT' THEN RETURN parsed::geometry(Point, 4674); END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  RETURN NULL;
END
$$;

CREATE OR REPLACE FUNCTION public.detran_jsonb_multipolygon_4674(payload jsonb)
RETURNS geometry(MultiPolygon, 4674)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  parsed geometry;
BEGIN
  IF payload IS NULL THEN RETURN NULL; END IF;
  BEGIN
    parsed := st_setsrid(st_geomfromgeojson(payload::text), 4674);
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  IF geometrytype(parsed) = 'POLYGON' THEN
    RETURN st_multi(parsed)::geometry(MultiPolygon, 4674);
  END IF;
  IF geometrytype(parsed) = 'MULTIPOLYGON' THEN
    RETURN parsed::geometry(MultiPolygon, 4674);
  END IF;
  RETURN NULL;
END
$$;
