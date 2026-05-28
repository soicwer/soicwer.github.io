# -*- coding: utf-8 -*-
"""
ШАГ 3. Распознавание речи локальной моделью OpenAI Whisper.

В финальной реализации:

    import whisper
    model = whisper.load_model(model_name)
    result = model.transcribe(audio_path, language="ru", word_timestamps=True)
    return result["segments"]

Каждый сегмент содержит:
    {
        "id": 0,
        "start": 12.34,             # секунды
        "end":   15.78,
        "text":  "что-то очень смешное",
        "no_speech_prob": 0.01,
        "avg_logprob": -0.27,
        "words": [{"word": "...", "start": ..., "end": ...}, ...]
    }
"""

from typing import List, Dict, Any

from utils.logger import get_logger

logger = get_logger(__name__)


def transcribe_audio(audio_path: str, model_name: str = "small") -> List[Dict[str, Any]]:
    """
    Распознаёт речь в WAV-файле и возвращает список сегментов с таймкодами.

    Параметры:
        audio_path: путь к WAV-файлу (16 кГц, моно);
        model_name: размер модели Whisper (tiny / base / small / medium / large).

    Возвращает:
        список сегментов в формате Whisper (start, end, text, ...).
    """
    logger.info("transcribe_audio: %s, model=%s", audio_path, model_name)

    # TODO (шаг 3): подключить openai-whisper
    #
    #     import whisper
    #     model = whisper.load_model(model_name)
    #     result = model.transcribe(
    #         audio_path,
    #         language="ru",          # либо None для автоопределения
    #         word_timestamps=True,   # таймкоды по словам — нужно для нарезки
    #         verbose=False,
    #     )
    #     return result["segments"]

    raise NotImplementedError(
        "Шаг 3 (транскрипция через openai-whisper) пока не реализован."
    )
