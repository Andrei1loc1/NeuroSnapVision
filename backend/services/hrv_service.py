import math
from typing import Optional

try:
    import numpy as np

    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


def _bandpass_filter(signal: list[float], sample_rate: int, lowcut: float, highcut: float) -> list[float]:
    cutoff_ratio_low = lowcut / (sample_rate / 2.0)
    cutoff_ratio_high = highcut / (sample_rate / 2.0)

    if not HAS_NUMPY:
        return signal

    alpha_low = 1.0 / (1.0 + 1.0 / (2.0 * math.pi * cutoff_ratio_low)) if cutoff_ratio_low < 1.0 else 1.0
    alpha_high = 1.0 / (1.0 + 1.0 / (2.0 * math.pi * cutoff_ratio_high)) if cutoff_ratio_high > 0.0 else 0.0

    arr = np.array(signal, dtype=np.float64)
    b, a = [alpha_low], [1.0, -(1.0 - alpha_low)]
    arr = np.signal.lfilter(b, a, arr) if hasattr(np, "signal") else arr

    rc_low = 1.0 / (2.0 * math.pi * lowcut) if lowcut > 0 else 0.001
    rc_high = 1.0 / (2.0 * math.pi * highcut) if highcut > 0 else 0.001
    dt = 1.0 / sample_rate
    alpha_low = dt / (rc_low + dt)
    alpha_high = dt / (rc_high + dt)

    low_passed = np.zeros_like(arr)
    high_passed = np.zeros_like(arr)
    low_passed[0] = arr[0]
    for i in range(1, len(arr)):
        low_passed[i] = alpha_low * arr[i] + (1.0 - alpha_low) * low_passed[i - 1]
    high_passed[0] = arr[0]
    for i in range(1, len(arr)):
        high_passed[i] = alpha_high * (high_passed[i - 1] + arr[i] - low_passed[i - 1])

    return low_passed.tolist()


def _bandpass_numpy(signal: list[float], sample_rate: int, lowcut: float, highcut: float) -> "np.ndarray":
    from scipy.signal import butter, filtfilt

    nyquist = sample_rate / 2.0
    low = lowcut / nyquist
    high = highcut / nyquist
    b, a = butter(2, [low, high], btype="band")
    arr = np.array(signal, dtype=np.float64)
    return filtfilt(b, a, arr)


def _bandpass_simple(signal: list[float], sample_rate: int, lowcut: float, highcut: float) -> list[float]:
    dt = 1.0 / sample_rate
    rc_high = 1.0 / (2.0 * math.pi * lowcut)
    rc_low = 1.0 / (2.0 * math.pi * highcut)
    alpha_high = rc_high / (rc_high + dt)
    alpha_low = dt / (rc_low + dt)

    high_passed = [0.0] * len(signal)
    low_passed = [0.0] * len(signal)
    result = [0.0] * len(signal)

    high_passed[0] = signal[0]
    low_passed[0] = signal[0]
    result[0] = 0.0

    for i in range(1, len(signal)):
        high_passed[i] = alpha_high * (high_passed[i - 1] + signal[i] - signal[i - 1])
        low_passed[i] = alpha_low * high_passed[i] + (1.0 - alpha_low) * low_passed[i - 1]
        result[i] = low_passed[i]

    return result


def _detect_peaks(signal: list[float], sample_rate: int, min_distance_sec: float = 0.3) -> list[int]:
    min_distance = max(1, int(min_distance_sec * sample_rate))
    peaks = []
    for i in range(1, len(signal) - 1):
        if signal[i] > signal[i - 1] and signal[i] > signal[i + 1]:
            if not peaks or (i - peaks[-1]) >= min_distance:
                peaks.append(i)
            else:
                if signal[i] > signal[peaks[-1]]:
                    peaks[-1] = i
    return peaks


def _detect_peaks_adaptive(signal: list[float], sample_rate: int) -> list[int]:
    if len(signal) < 5:
        return []

    window_size = min(len(signal), sample_rate * 3)
    threshold_factor = 0.4

    mean_val = sum(signal) / len(signal)
    signal_positive = [s - mean_val for s in signal]

    peaks = _detect_peaks(signal_positive, sample_rate, min_distance_sec=0.25)

    if len(peaks) < 3:
        peaks = _detect_peaks(signal_positive, sample_rate, min_distance_sec=0.2)

    return peaks


def _compute_nn_intervals(peaks: list[int], sample_rate: int) -> list[float]:
    if len(peaks) < 2:
        return []
    intervals = []
    for i in range(1, len(peaks)):
        interval_ms = (peaks[i] - peaks[i - 1]) / sample_rate * 1000.0
        if 300.0 <= interval_ms <= 2000.0:
            intervals.append(interval_ms)
    return intervals


def _compute_sdnn(nn_intervals: list[float]) -> float:
    if len(nn_intervals) < 2:
        return 0.0
    n = len(nn_intervals)
    mean_nn = sum(nn_intervals) / n
    variance = sum((x - mean_nn) ** 2 for x in nn_intervals) / (n - 1)
    return math.sqrt(variance)


def _compute_rmssd(nn_intervals: list[float]) -> float:
    if len(nn_intervals) < 2:
        return 0.0
    successive_diffs = []
    for i in range(1, len(nn_intervals)):
        successive_diffs.append((nn_intervals[i] - nn_intervals[i - 1]) ** 2)
    return math.sqrt(sum(successive_diffs) / len(successive_diffs))


def _assess_quality(nn_intervals: list[float], signal_length: int, sample_rate: int) -> str:
    expected_beats = (signal_length / sample_rate) * 1.0
    detected_beats = len(nn_intervals) + 1

    if expected_beats <= 0:
        return "poor"

    ratio = detected_beats / expected_beats
    if 0.7 <= ratio <= 1.5 and len(nn_intervals) >= 10:
        return "good"
    elif 0.5 <= ratio <= 2.0 and len(nn_intervals) >= 5:
        return "acceptable"
    else:
        return "poor"


def process_ppg_signal(signal_data: list[float], sample_rate: int = 30) -> dict:
    if not signal_data or len(signal_data) < sample_rate:
        return {
            "sdnn": 0.0,
            "rmssd": 0.0,
            "heart_rate": 0.0,
            "stress_level": 10,
            "quality": "poor",
            "error": "Semnal insuficient pentru analiză (minim 1 secundă)",
        }

    filtered = _bandpass_simple(signal_data, sample_rate, 0.5, 4.0)

    peaks = _detect_peaks_adaptive(filtered, sample_rate)

    if len(peaks) < 2:
        return {
            "sdnn": 0.0,
            "rmssd": 0.0,
            "heart_rate": 0.0,
            "stress_level": 10,
            "quality": "poor",
            "error": "Nu s-au detectat bătăi suficiente în semnal",
        }

    nn_intervals = _compute_nn_intervals(peaks, sample_rate)

    if len(nn_intervals) < 2:
        return {
            "sdnn": 0.0,
            "rmssd": 0.0,
            "heart_rate": 0.0,
            "stress_level": 10,
            "quality": "poor",
            "error": "Intervale NN insuficiente pentru calcul HRV",
        }

    sdnn = _compute_sdnn(nn_intervals)
    rmssd = _compute_rmssd(nn_intervals)
    mean_nn = sum(nn_intervals) / len(nn_intervals)
    heart_rate = 60000.0 / mean_nn if mean_nn > 0 else 0.0
    stress_level, stress_desc = classify_stress_level(rmssd)
    quality = _assess_quality(nn_intervals, len(signal_data), sample_rate)

    return {
        "sdnn": round(sdnn, 2),
        "rmssd": round(rmssd, 2),
        "heart_rate": round(heart_rate, 1),
        "stress_level": stress_level,
        "stress_description": stress_desc,
        "quality": quality,
        "beats_detected": len(peaks),
        "nn_intervals_count": len(nn_intervals),
    }


def classify_stress_level(rmssd: float) -> tuple[int, str]:
    if rmssd > 60:
        level = 1 if rmssd > 80 else 2
        return level, "Relaxare profundă — sistemul nervos parasimpatic dominant"
    elif rmssd > 40:
        if rmssd > 55:
            level = 3
        elif rmssd > 47:
            level = 4
        else:
            level = 5
        return level, "Stare normală — echilibru simpatic/parasimpatic"
    elif rmssd > 25:
        level = 6 if rmssd > 33 else 7
        return level, "Stres moderat — activitate simpatică crescută"
    else:
        level = 8 if rmssd > 18 else (9 if rmssd > 12 else 10)
        return level, "Stres intens — suprasolicitare simpatică"


def get_breathing_exercise(duration_sec: int = 60) -> dict:
    inhale = 4
    hold = 7
    exhale = 8
    cycle_duration = inhale + hold + exhale
    total_cycles = max(1, duration_sec // cycle_duration)
    actual_duration = total_cycles * cycle_duration

    pattern = []
    for i in range(total_cycles):
        pattern.append({"phase": "inhale", "duration_sec": inhale, "cycle": i + 1})
        pattern.append({"phase": "hold", "duration_sec": hold, "cycle": i + 1})
        pattern.append({"phase": "exhale", "duration_sec": exhale, "cycle": i + 1})

    return {
        "pattern": pattern,
        "total_cycles": total_cycles,
        "total_duration_sec": actual_duration,
        "instruction": (
            f"Tehnica 4-7-8: inspiră pe nas {inhale} secunde, "
            f"ține respirația {hold} secunde, expiră pe gură {exhale} secunde. "
            f"Repetă {total_cycles} cicluri. Această tehnică activează sistemul nervos parasimpatic "
            f"și reduce stresul în {actual_duration} secunde."
        ),
        "phases": {
            "inhale_sec": inhale,
            "hold_sec": hold,
            "exhale_sec": exhale,
        },
    }