# -*- coding: utf-8 -*-
"""
ШАГ 2. Извлечение аудиодорожки из видеофайла через MoviePy.

Whisper ожидает на входе аудио 16 кГц, моно. Поэтому мы сразу при
извлечении приводим звук к нужному формату, чтобы не делать лишний
ресемплинг внутри Whisper.
"""

import os

from utils.logger import get_logger

logger = get_logger(__name__)


def extract_audio(video_path: str, output_dir: str) -> str:
    """
    Извлекает аудиодорожку из видео и сохраняет рядом WAV-файл (16 кГц моно).

    Параметры:
        video_path: путь к исходному видеофайлу;
        output_dir: каталог, куда положить временное аудио.

    Возвращает:
        путь к сохранённому WAV-файлу.
    """
    if not os.path.isfile(video_path):
        raise FileNotFoundError(f"Видеофайл не найден: {video_path}")

    os.makedirs(output_dir, exist_ok=True)

    # Имя аудио = имя видео без расширения + .wav
    base = os.path.splitext(os.path.basename(video_path))[0]
    audio_path = os.path.join(output_dir, f"{base}.wav")

    logger.info("Извлекаю аудио: %s → %s", video_path, audio_path)

    # Импортируем moviepy лениво — окно открывается мгновенно, даже
    # если библиотека ещё не подгружена (она тяжёлая).
    try:
        # moviepy v1: from moviepy.editor import VideoFileClip
        # moviepy v2: from moviepy import VideoFileClip
        try:
            from moviepy.editor import VideoFileClip
        except ImportError:
            from moviepy import VideoFileClip  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "Не установлена библиотека moviepy. "
            "Запустите: pip install moviepy"
        ) from exc

    with VideoFileClip(video_path) as clip:
        if clip.audio is None:
            raise RuntimeError("В исходном видео отсутствует аудиодорожка.")

        # 16 кГц моно — нужный Whisper формат
        clip.audio.write_audiofile(
            audio_path,
            fps=16000,
            nbytes=2,
            codec="pcm_s16le",
            ffmpeg_params=["-ac", "1"],   # принудительно один канал
            logger=None,                  # глушим прогресс-бар MoviePy в stdout
        )

    if not os.path.isfile(audio_path):
        raise RuntimeError(f"Не удалось создать WAV-файл: {audio_path}")

    logger.info("Аудио извлечено: %s (%.1f МБ)",
                audio_path, os.path.getsize(audio_path) / 1_048_576)
    return audio_path
