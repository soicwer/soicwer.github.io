# -*- coding: utf-8 -*-
"""
ШАГ 3. Распознавание речи локальной моделью OpenAI Whisper.

Whisper загружает модель один раз (модель может весить от ~75 МБ до ~3 ГБ
в зависимости от размера) и далее переиспользует её. Мы кэшируем модель
в глобальном словаре `_loaded_models`, чтобы не подгружать заново при
повторных запусках в одном сеансе работы приложения.
"""

from typing import Any, Dict, List, Optional

from utils.logger import get_logger

logger = get_logger(__name__)


# Кэш загруженных моделей: {имя_модели: model_object}
_loaded_models: Dict[str, Any] = {}


def _get_model(model_name: str):
    """Загружает (или достаёт из кэша) модель Whisper по имени."""
    if model_name in _loaded_models:
        return _loaded_models[model_name]

    try:
        import whisper  # noqa: WPS433 — ленивый импорт
    except ImportError as exc:
        raise RuntimeError(
            "Не установлена библиотека openai-whisper. "
            "Запустите: pip install openai-whisper"
        ) from exc

    logger.info("Загружаю модель Whisper '%s' (может занять время при первом запуске)…",
                model_name)
    model = whisper.load_model(model_name)
    _loaded_models[model_name] = model
    return model


def transcribe_audio(
    audio_path: str,
    model_name: str = "small",
    language: Optional[str] = "ru",
) -> List[Dict[str, Any]]:
    """
    Распознаёт речь в WAV-файле и возвращает список сегментов с таймкодами.

    Параметры:
        audio_path: путь к WAV-файлу (16 кГц, моно);
        model_name: размер модели (tiny / base / small / medium / large);
        language:   код языка ("ru", "en", …) или None для автоопределения.

    Возвращает:
        список словарей вида:
        [
            {"start": 12.34, "end": 15.78, "text": "что-то очень смешное",
             "no_speech_prob": 0.01, "avg_logprob": -0.27,
             "words": [{"word": "...", "start": ..., "end": ...}, ...]},
            ...
        ]
    """
    logger.info("Транскрибирую %s моделью '%s'…", audio_path, model_name)

    model = _get_model(model_name)

    result = model.transcribe(
        audio_path,
        language=language,
        word_timestamps=True,   # таймкоды по словам нужны для аккуратной нарезки
        verbose=False,
        fp16=False,             # совместимо с CPU (на GPU включится отдельно)
    )

    segments: List[Dict[str, Any]] = result.get("segments", [])
    logger.info("Распознано сегментов: %d (общая длительность речи)", len(segments))
    return segments
