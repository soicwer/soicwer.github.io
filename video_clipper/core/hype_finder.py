# -*- coding: utf-8 -*-
"""
ШАГ 4. Поиск «хайповых» моментов в распознанной речи.

Стратегия:
    1. Перебираем сегменты Whisper.
    2. Если в тексте сегмента встречается ключевое слово ИЛИ один из
       «звуковых маркеров» Whisper в квадратных скобках:
           [смех], [аплодисменты], [крик], (laughter), (applause)
       — помечаем такой сегмент как «хайповый».
    3. Соседние хайповые сегменты объединяем, чтобы получить отрезок
       длиной 30–50 секунд (границы задаёт пользователь).

Это заглушка — финальная реализация появится на этапе 4.
"""

from typing import List, Dict, Any

from utils.logger import get_logger

logger = get_logger(__name__)


# Маркеры, которые Whisper иногда вставляет в скобках для невербальных звуков
NON_SPEECH_MARKERS = (
    "[смех]", "[laugh", "(laugh",
    "[аплодисмент", "[applause", "(applause",
    "[крик", "[shout", "(scream",
)


def find_hype_moments(
    segments: List[Dict[str, Any]],
    keywords: List[str],
    min_seconds: int = 30,
    max_seconds: int = 50,
) -> List[Dict[str, float]]:
    """
    Возвращает список интервалов вида [{"start": float, "end": float, "reason": str}].

    Параметры:
        segments:   сегменты от Whisper;
        keywords:   список триггерных слов (в нижнем регистре);
        min_seconds, max_seconds: ограничения длины итогового клипа.
    """
    logger.info(
        "find_hype_moments: %d сегментов, %d ключевых слов",
        len(segments), len(keywords),
    )

    # TODO (шаг 4): реализовать полноценный поиск и объединение интервалов.
    #
    # Пример наброска:
    #
    #     hype = []
    #     for seg in segments:
    #         text = seg["text"].lower()
    #         if any(kw in text for kw in keywords) or \
    #            any(marker in text for marker in NON_SPEECH_MARKERS):
    #             hype.append(seg)
    #     # затем объединить соседние сегменты и обрезать до [min, max] секунд

    raise NotImplementedError(
        "Шаг 4 (поиск хайповых моментов) пока не реализован."
    )
