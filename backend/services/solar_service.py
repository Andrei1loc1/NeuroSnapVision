import math
from datetime import datetime, timedelta, timezone


def _to_julian_day(dt: datetime) -> float:
    year = dt.year
    month = dt.month
    day = dt.day
    if month <= 2:
        year -= 1
        month += 12
    A = year // 100
    B = 2 - A + A // 4
    jd = math.floor(365.25 * (year + 4716)) + math.floor(30.6001 * (month + 1)) + day + B - 1524.5
    jd += dt.hour / 24.0 + dt.minute / 1440.0 + dt.second / 86400.0
    return jd


def _solar_declination(jd: float) -> float:
    n = jd - 2451545.0
    L = math.radians(280.460 + 0.9856474 * n) % (2 * math.pi)
    g = math.radians(357.528 + 0.9856003 * n) % (2 * math.pi)
    if g < 0:
        g += 2 * math.pi
    lambda_sun = L + math.radians(1.915) * math.sin(g) + math.radians(0.020) * math.sin(2 * g)
    obliquity = math.radians(23.439 - 0.0000004 * n)
    declination = math.asin(math.sin(obliquity) * math.sin(lambda_sun))
    return declination


def _equation_of_time(jd: float) -> float:
    n = jd - 2451545.0
    L = math.radians(280.460 + 0.9856474 * n) % (2 * math.pi)
    g = math.radians(357.528 + 0.9856003 * n) % (2 * math.pi)
    if g < 0:
        g += 2 * math.pi
    epsilon = math.radians(23.439 - 0.0000004 * n)
    lambda_sun = L + math.radians(1.915) * math.sin(g) + math.radians(0.020) * math.sin(2 * g)
    alpha = math.atan2(math.cos(epsilon) * math.sin(lambda_sun), math.cos(lambda_sun))
    eot = (L - alpha) % (2 * math.pi)
    if eot > math.pi:
        eot -= 2 * math.pi
    eot_minutes = math.degrees(eot) * 4
    return eot_minutes


def _solar_noon_utc(longitude: float, jd: float) -> float:
    eot = _equation_of_time(jd)
    noon_jd = jd - longitude / 360.0 + eot / 1440.0
    noon_base = math.floor(noon_jd - 0.5) + 0.5
    noon_frac = noon_jd - noon_base
    return noon_frac * 24.0


def _sunrise_sunset_utc(latitude: float, longitude: float, jd: float, angle: float = -0.833):
    declination = _solar_declination(jd)
    lat_rad = math.radians(latitude)
    cos_ha = (math.sin(math.radians(angle)) - math.sin(lat_rad) * math.sin(declination)) / (
        math.cos(lat_rad) * math.cos(declination)
    )
    if cos_ha > 1:
        return None, None
    if cos_ha < -1:
        return None, None
    ha = math.degrees(math.acos(cos_ha))
    eot = _equation_of_time(jd)
    noon_hours = 12 - longitude / 15.0 + eot / 60.0
    sunrise = noon_hours - ha / 15.0
    sunset = noon_hours + ha / 15.0
    return sunrise, sunset


def _hours_to_time_str(hours: float) -> str:
    if hours is None:
        return "--:--"
    hours = hours % 24
    h = int(hours)
    m = int(round((hours - h) * 60))
    if m == 60:
        h += 1
        m = 0
    return f"{h:02d}:{m:02d}"


def _time_str_to_hours(time_str: str) -> float:
    parts = time_str.replace(" ", "").split(":")
    h = int(parts[0])
    m = int(parts[1]) if len(parts) > 1 else 0
    if "pm" in time_str.lower() and h != 12:
        h += 12
    elif "am" in time_str.lower() and h == 12:
        h = 0
    return h + m / 60.0


def calculate_solar_position(latitude: float, longitude: float, dt: datetime) -> dict:
    jd = _to_julian_day(dt)
    declination = _solar_declination(jd)

    hour_angle_deg = (dt.hour + dt.minute / 60.0) * 15.0 - 180.0 + longitude
    hour_angle = math.radians(hour_angle_deg)
    lat_rad = math.radians(latitude)

    elevation = math.degrees(
        math.asin(
            math.sin(lat_rad) * math.sin(declination)
            + math.cos(lat_rad) * math.cos(declination) * math.cos(hour_angle)
        )
    )

    azimuth = math.degrees(
        math.atan2(
            math.sin(hour_angle),
            math.cos(hour_angle) * math.sin(lat_rad) - math.tan(declination) * math.cos(lat_rad),
        )
    ) + 180.0

    return {
        "declination": round(math.degrees(declination), 2),
        "elevation": round(elevation, 2),
        "azimuth": round(azimuth % 360, 2),
    }


def calculate_solar_noon(latitude: float, longitude: float, dt: datetime, tz_offset: float = 0.0) -> str:
    jd = _to_julian_day(dt)
    noon_utc = _solar_noon_utc(longitude, jd)
    noon_local = noon_utc + tz_offset
    return _hours_to_time_str(noon_local)


def calculate_sunrise_sunset(
    latitude: float, longitude: float, dt: datetime, tz_offset: float = 0.0
) -> tuple:
    jd = _to_julian_day(dt)
    sunrise_utc, sunset_utc = _sunrise_sunset_utc(latitude, longitude, jd)
    if sunrise_utc is None:
        return "--:--", "--:--"
    sunrise_local = sunrise_utc + tz_offset
    sunset_local = sunset_utc + tz_offset
    return _hours_to_time_str(sunrise_local), _hours_to_time_str(sunset_local)


def estimate_dlmo(sleep_time: str) -> str:
    sleep_hours = _time_str_to_hours(sleep_time)
    dlmo_hours = sleep_hours - 2.0
    if dlmo_hours < 0:
        dlmo_hours += 24
    return _hours_to_time_str(dlmo_hours)


def estimate_circadian_phase(wake_time: str, sleep_time: str, current_time: str = None) -> float:
    wake_hours = _time_str_to_hours(wake_time)
    sleep_hours = _time_str_to_hours(sleep_time)
    if sleep_hours < wake_hours:
        sleep_hours += 24
    day_length = sleep_hours - wake_hours
    if current_time:
        current_hours = _time_str_to_hours(current_time)
        if current_hours < wake_hours:
            current_hours += 24
        elapsed = current_hours - wake_hours
    else:
        elapsed = day_length / 2
    phase = (elapsed / 24.0) * 360.0
    return round(phase % 360, 1)


def calculate_metabolic_efficiency(
    current_time: str, wake_time: str, sleep_time: str, latitude: float, longitude: float, dt: datetime, tz_offset: float = 0.0
) -> float:
    current_hours = _time_str_to_hours(current_time)
    wake_hours = _time_str_to_hours(wake_time)
    sleep_hours = _time_str_to_hours(sleep_time)

    if current_hours < wake_hours:
        current_hours += 24
    if sleep_hours < wake_hours:
        sleep_hours += 24

    solar_pos = calculate_solar_position(latitude, longitude, dt)
    elevation = solar_pos["elevation"]

    if elevation > 30:
        solar_factor = 1.0
    elif elevation > 0:
        solar_factor = 0.6 + 0.4 * (elevation / 30.0)
    elif elevation > -6:
        solar_factor = 0.3 + 0.3 * ((elevation + 6) / 6.0)
    elif elevation > -12:
        solar_factor = 0.1 + 0.2 * ((elevation + 12) / 6.0)
    else:
        solar_factor = 0.05

    dlmo_hours = _time_str_to_hours(estimate_dlmo(sleep_time))
    if dlmo_hours < wake_hours:
        dlmo_hours += 24

    if current_hours >= wake_hours and current_hours <= dlmo_hours:
        hours_since_wake = current_hours - wake_hours
        active_duration = dlmo_hours - wake_hours
        circadian_factor = 0.5 + 0.5 * math.sin(math.pi * hours_since_wake / active_duration)
    elif current_hours > dlmo_hours:
        hours_after_dlmo = current_hours - dlmo_hours
        circadian_factor = max(0.1, 0.5 * math.exp(-0.3 * hours_after_dlmo))
    else:
        circadian_factor = 0.05

    efficiency = 0.4 * solar_factor + 0.6 * circadian_factor
    return round(max(0.0, min(1.0, efficiency)), 2)


def calculate_optimal_eating_window(wake_time: str, sleep_time: str) -> dict:
    wake_hours = _time_str_to_hours(wake_time)
    sleep_hours = _time_str_to_hours(sleep_time)
    if sleep_hours < wake_hours:
        sleep_hours += 24

    start_hours = wake_hours + 1.0
    dlmo_hours = sleep_hours - 2.0

    if start_hours >= 24:
        start_hours -= 24

    return {
        "start": _hours_to_time_str(start_hours),
        "end": _hours_to_time_str(dlmo_hours % 24),
    }


def determine_phase(current_time: str, wake_time: str, sleep_time: str) -> str:
    current_hours = _time_str_to_hours(current_time)
    wake_hours = _time_str_to_hours(wake_time)
    sleep_hours = _time_str_to_hours(sleep_time)

    if wake_hours > sleep_hours:
        if current_hours >= wake_hours or current_hours < sleep_hours:
            pass
        else:
            wake_hours -= 24
    if sleep_hours < wake_hours:
        sleep_hours += 24
    if current_hours < wake_hours:
        current_hours += 24

    dlmo_hours = sleep_hours - 2.0

    if current_hours >= wake_hours and current_hours < wake_hours + 2:
        return "transition"
    elif current_hours >= wake_hours + 2 and current_hours < dlmo_hours - 2:
        return "alert"
    elif current_hours >= dlmo_hours - 2 and current_hours < dlmo_hours:
        return "wind-down"
    elif current_hours >= dlmo_hours and current_hours < sleep_hours:
        return "wind-down"
    else:
        return "sleep"


def calculate_metabolic_multiplier(
    current_time: str, wake_time: str, sleep_time: str
) -> float:
    current_hours = _time_str_to_hours(current_time)
    wake_hours = _time_str_to_hours(wake_time)
    sleep_hours = _time_str_to_hours(sleep_time)

    if sleep_hours < wake_hours:
        sleep_hours += 24

    optimal_start = wake_hours + 1.0
    dlmo_hours = sleep_hours - 2.0

    if current_hours < wake_hours:
        current_hours += 24

    if current_hours >= optimal_start and current_hours <= dlmo_hours:
        return 1.0

    if current_hours > dlmo_hours:
        hours_after = current_hours - dlmo_hours
        multiplier = 1.0 + 0.4 * (1 - math.exp(-0.5 * hours_after))
        return round(min(multiplier, 1.5), 2)

    if current_hours < optimal_start:
        hours_before = optimal_start - current_hours
        multiplier = 1.0 + 0.2 * (1 - math.exp(-0.3 * hours_before))
        return round(min(multiplier, 1.2), 2)

    return 1.0


def calculate_solar_window(
    latitude: float,
    longitude: float,
    wake_time: str,
    sleep_time: str,
    timezone_offset: float = 0.0,
) -> dict:
    now = datetime.utcnow()
    jd = _to_julian_day(now)

    solar_pos = calculate_solar_position(latitude, longitude, now)
    solar_noon = calculate_solar_noon(latitude, longitude, now, timezone_offset)
    sunrise, sunset = calculate_sunrise_sunset(latitude, longitude, now, timezone_offset)
    dlmo = estimate_dlmo(sleep_time)
    optimal_window = calculate_optimal_eating_window(wake_time, sleep_time)

    current_time_str = now.strftime("%H:%M")
    current_hours_utc = now.hour + now.minute / 60.0
    current_local = current_hours_utc + timezone_offset
    current_time_local = _hours_to_time_str(current_local)

    efficiency = calculate_metabolic_efficiency(
        current_time_local, wake_time, sleep_time, latitude, longitude, now, timezone_offset
    )
    phase = determine_phase(current_time_local, wake_time, sleep_time)
    multiplier = calculate_metabolic_multiplier(current_time_local, wake_time, sleep_time)

    return {
        "solar_noon": solar_noon,
        "sunrise": sunrise,
        "sunset": sunset,
        "current_solar_angle": solar_pos["elevation"],
        "melatonin_onset": dlmo,
        "optimal_eating_window": optimal_window,
        "current_metabolic_efficiency": efficiency,
        "phase": phase,
        "metabolic_multiplier": multiplier,
    }