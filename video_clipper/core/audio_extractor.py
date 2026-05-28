# -*- coding: utf-8 -*-
"""
ШАГ 2. Извлечение аудиодорожки из видеофайла.

В финальной реализации будет использоваться moviepy:

    from moviepy.editor import VideoFileClip
    clip = VideoFileClip(video_path)
    clip.audio.write_audiofile(audio_path, codec="pcm_s16le", fps=16000)

Сейчас функция — заглушка. Подробная реализация появится на следующем
этапе. Запуск из GUI приводит к понятному сообщению в журнале.
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
    logger.info("extract_audio: %s → %s", video_path, output_dir)

    # Имя аудио = имя видео без расширения + .wav
    base = os.path.splitext(os.path.basename(video_path))[0]
    audio_path = os.path.join(output_dir, f"{base}.wav")

    # TODO (шаг 2): подключить moviepy
    #
    #     from moviepy.editor import VideoFileClip
    #     with VideoFileClip(video_path) as clip:
    #         clip.audio.write_audiofile(
    #             audio_path,
    #             fps=16000,            # Whisper хочет 16 кГц
    #             nbytes=2,             # 16-битный PCM
    #             codec="pcm_s16le",
    #             ffmpeg_params=["-ac", "1"],   # моно
    #         )

    raise NotImplementedError(
        "Шаг 2 (извлечение аудио через moviepy) пока не реализован."
    )
