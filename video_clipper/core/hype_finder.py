# -*- coding: utf-8 -*-
"""
ШАГ 4. Поиск «хайповых» моментов в распознанной речи.

Алгоритм работы:

1.  Для каждого сегмента Whisper считаем «балл интересности» (score):
      +3 за каждое попадание триггерного слова из пользовательского списка;
      +4 за маркер невербального звука ([смех], [аплодисменты], [крик], …);
      +1 за восклицание / вопрос ("!", "?");
      +1 за всплеск громкости голоса (Whisper косвенно показывает её через
          avg_logprob — чем выше, тем увереннее модель и громче речь).

2.  Сегменты с score > 0 считаются «кандидатами».

3.  Для каждого кандидата создаём окно длиной target_seconds (~90 сек),
    центрированное вокруг кандидата, и обрезаем его границами видео.

4.  Окна сортируются по убыванию суммарного score (внутри окна) и
    объединяются, если пересекаются. На выходе — список непересекающихся
    интервалов, отсортированных по времени начала.

5.  Если ни одного триггера не нашлось — программа возвращает «равномерные»
    окна по всей длительности видео, чтобы пользователь всё равно получил
    готовые клипы.
"""

from typing import Any, Dict, List, Tuple

from utils.logger import get_logger

logger = get_logger(__name__)


# Маркеры, которые Whisper иногда вставляет в скобках для невербальных звуков.
# Сравнение идёт по подстроке в нижнем регистре, поэтому достаточно префиксов.
NON_SPEECH_MARKERS: Tuple[str, ...] = (
    "[смех", "(смех", "[laugh", "(laugh",
    "[аплодисмент", "(аплодисмент", "[applause", "(applause",
    "[крик", "(крик", "[shout", "(shout", "[scream", "(scream",
    "[музык", "(музык", "[music", "(music",
    "[ах", "[ох", "[вау", "[wow",
)


def _score_segment(text: str, keywords: List[str], avg_logprob: float) -> int:
    """Считает балл «хайповости» для одного сегмента речи."""
    text_lower = text.lower()
    score = 0

    # Ключевые слова пользователя
    for kw in keywords:
        if kw and kw in text_lower:
            score += 3

    # Невербальные маркеры от Whisper
    for marker in NON_SPEECH_MARKERS:
        if marker in text_lower:
            score += 4

    # Эмоциональная пунктуация
    score += min(text.count("!"), 3)
    score += min(text.count("?"), 2)

    # Громкая/уверенная речь — avg_logprob ближе к нулю означает уверенность
    # модели; такие куски обычно содержат хорошо слышимую речь.
    if avg_logprob > -0.4:
        score += 1

    return score


def _merge_overlapping(
    windows: List[Dict[str, float]],
) -> List[Dict[str, float]]:
    """Сливает пересекающиеся интервалы, складывая их score."""
    if not windows:
        return []

    windows = sorted(windows, key=lambda w: w["start"])
    merged: List[Dict[str, float]] = [dict(windows[0])]
    for window in windows[1:]:
        last = merged[-1]
        if window["start"] <= last["end"]:
            last["end"] = max(last["end"], window["end"])
            last["score"] = last.get("score", 0) + window.get("score", 0)
        else:
            merged.append(dict(window))
    return merged


def find_hype_moments(
    segments: List[Dict[str, Any]],
    keywords: List[str],
    min_seconds: int = 60,
    max_seconds: int = 90,
    video_duration: float = 0.0,
    max_clips: int = 10,
) -> List[Dict[str, float]]:
    """
    Возвращает список интервалов вида [{"start": float, "end": float, "score": int}].

    Параметры:
        segments:        сегменты Whisper;
        keywords:        список триггерных слов (любые регистры, мы приведём);
        min_seconds:     минимальная длина итогового клипа;
        max_seconds:     максимальная длина (целевая, около 90 секунд);
        video_duration:  длительность исходного видео в секундах (для границ);
        max_clips:       сколько лучших клипов вернуть.
    """
    keywords_norm = [kw.lower().strip() for kw in keywords if kw and kw.strip()]
    target = (min_seconds + max_seconds) / 2.0
    half = target / 2.0

    logger.info(
        "Поиск хайповых моментов: %d сегментов, %d ключевых слов, цель ~%.0f сек",
        len(segments), len(keywords_norm), target,
    )

    # ----- 1. Считаем балл каждого сегмента -----
    candidates: List[Dict[str, float]] = []
    for seg in segments:
        text = seg.get("text", "") or ""
        avg_logprob = float(seg.get("avg_logprob", -1.0))
        score = _score_segment(text, keywords_norm, avg_logprob)
        if score <= 0:
            continue

        seg_start = float(seg.get("start", 0.0))
        seg_end = float(seg.get("end", seg_start))
        center = (seg_start + seg_end) / 2.0

        # Окно фиксированной целевой длины, центрированное вокруг кандидата
        win_start = max(0.0, center - half)
        win_end = win_start + target
        if video_duration > 0 and win_end > video_duration:
            win_end = video_duration
            win_start = max(0.0, win_end - target)

        if (win_end - win_start) < min_seconds:
            continue

        candidates.append({
            "start": win_start,
            "end": win_end,
            "score": score,
            "trigger_text": text.strip()[:80],
        })

    # ----- 2. Если ни одного триггера — режем равномерно -----
    if not candidates and video_duration > 0:
        logger.info(
            "Триггеров не найдено — режу равномерно каждые %.0f сек.", target,
        )
        result: List[Dict[str, float]] = []
        cursor = 0.0
        while cursor + min_seconds <= video_duration and len(result) < max_clips:
            end = min(cursor + target, video_duration)
            if end - cursor >= min_seconds:
                result.append({"start": cursor, "end": end, "score": 0,
                               "trigger_text": "равномерная нарезка"})
            cursor = end
        return result

    # ----- 3. Сортируем по убыванию score и объединяем пересечения -----
    candidates.sort(key=lambda w: w["score"], reverse=True)
    merged = _merge_overlapping(candidates)
    # После слияния снова отсортируем — теперь по времени для стабильного порядка
    merged.sort(key=lambda w: w["start"])

    # Ограничиваем количество выходных клипов, оставляя лучшие по score
    if len(merged) > max_clips:
        merged.sort(key=lambda w: w["score"], reverse=True)
        merged = merged[:max_clips]
        merged.sort(key=lambda w: w["start"])

    logger.info("Итого хайповых интервалов: %d", len(merged))
    return merged
