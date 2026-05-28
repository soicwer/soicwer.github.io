# -*- coding: utf-8 -*-
"""
ШАГ 5. Нарезка видео в вертикальный формат 9:16 с размытым фоном.

Что делает функция cut_vertical_clip:

1.  Открывает исходное видео через moviepy и вырезает интервал
    [start..end] методом subclip.
2.  Готовит ЗАДНИЙ слой — копию того же отрезка, растянутую на весь
    кадр 1080x1920 и пропущенную через cv2.GaussianBlur.
3.  Готовит ПЕРЕДНИЙ слой — исходный отрезок, вписанный по ширине в
    1080 пикселей, по центру по вертикали.
4.  Композитит оба слоя в CompositeVideoClip и сохраняет mp4 (H.264 + AAC).
5.  Возвращает путь к готовому файлу — он сразу пригоден для скачивания
    / выкладки в Shorts.

Если use_blur=False — кадр просто помещается на чёрный фон.
"""

import os

from utils.logger import get_logger
from utils.paths import make_clip_path

logger = get_logger(__name__)


# Целевое разрешение Shorts / TikTok / Reels — стандарт 1080x1920.
TARGET_WIDTH = 1080
TARGET_HEIGHT = 1920


def _import_moviepy():
    """Ленивая загрузка moviepy с поддержкой v1 и v2 API."""
    try:
        from moviepy.editor import (
            VideoFileClip, CompositeVideoClip, ColorClip,
        )
        return VideoFileClip, CompositeVideoClip, ColorClip
    except ImportError:
        from moviepy import (  # type: ignore
            VideoFileClip, CompositeVideoClip, ColorClip,
        )
        return VideoFileClip, CompositeVideoClip, ColorClip


def _make_blur_fn(blur_strength: int = 35):
    """
    Возвращает функцию, которую можно передать в clip.fl_image(...).

    Создаёт сильно размытый, растянутый на полный экран кадр —
    он становится «обоями» позади исходного видео.
    """
    try:
        import cv2
        import numpy as np  # noqa: F401 — cv2 возвращает массив numpy
    except ImportError as exc:
        raise RuntimeError(
            "Не установлен opencv-python. "
            "Запустите: pip install opencv-python"
        ) from exc

    def _blur_frame(frame):
        # frame — ndarray (H, W, 3) в формате RGB
        resized = cv2.resize(frame, (TARGET_WIDTH, TARGET_HEIGHT))
        return cv2.GaussianBlur(resized, ksize=(0, 0), sigmaX=blur_strength)

    return _blur_frame


def cut_vertical_clip(
    video_path: str,
    start: float,
    end: float,
    output_dir: str,
    index: int,
    use_blur: bool = True,
) -> str:
    """
    Вырезает отрезок видео и сохраняет его в формате 9:16.

    Параметры:
        video_path: путь к исходному видео;
        start, end: границы отрезка в секундах;
        output_dir: куда сохранить готовый клип;
        index:      порядковый номер клипа (используется в имени файла);
        use_blur:   если True — добавляется размытый фон вместо чёрных полос.

    Возвращает:
        путь к сохранённому mp4-файлу.
    """
    if end <= start:
        raise ValueError(f"Некорректный интервал клипа: start={start}, end={end}")

    output_path = make_clip_path(output_dir, index)
    logger.info(
        "Нарезка клипа %d: %.2f..%.2f → %s (blur=%s)",
        index, start, end, output_path, use_blur,
    )

    VideoFileClip, CompositeVideoClip, ColorClip = _import_moviepy()

    with VideoFileClip(video_path) as source:
        # Защищаемся от выхода за длительность исходника
        safe_end = min(end, source.duration)
        if safe_end <= start:
            raise ValueError(
                f"Интервал выходит за длительность видео ({source.duration:.1f} c)."
            )
        subclip = source.subclip(start, safe_end)

        # --- Передний слой: исходное видео, вписанное по ширине ---
        foreground = subclip.resize(width=TARGET_WIDTH)

        # Если после масштабирования по ширине высота получилась больше
        # 1920 — это значит, что исходник «слишком вертикальный»; в этом
        # случае масштабируем по высоте, чтобы он гарантированно влез.
        if foreground.h > TARGET_HEIGHT:
            foreground = subclip.resize(height=TARGET_HEIGHT)

        foreground = foreground.set_position(("center", "center"))

        # --- Задний слой ---
        if use_blur:
            blur_fn = _make_blur_fn(blur_strength=35)
            background = (
                subclip
                .fl_image(blur_fn)
                .resize((TARGET_WIDTH, TARGET_HEIGHT))
            )
        else:
            # Чёрный задний фон 1080x1920 такой же длительности, как клип
            background = ColorClip(
                size=(TARGET_WIDTH, TARGET_HEIGHT),
                color=(0, 0, 0),
                duration=subclip.duration,
            )

        # --- Композит ---
        composite = CompositeVideoClip(
            [background, foreground],
            size=(TARGET_WIDTH, TARGET_HEIGHT),
        ).set_audio(subclip.audio)

        # Защитный временный файл для аудио (moviepy любит ругаться без него)
        temp_audio = os.path.join(output_dir, f".temp_audio_{index}.m4a")

        composite.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            fps=min(30, source.fps or 30),
            bitrate="6000k",
            preset="medium",
            threads=4,
            temp_audiofile=temp_audio,
            remove_temp=True,
            logger=None,
        )

        # На всякий случай удаляем хвостовой temp-файл, если он остался
        if os.path.exists(temp_audio):
            try:
                os.remove(temp_audio)
            except OSError:
                pass

        composite.close()

    if not os.path.isfile(output_path):
        raise RuntimeError(f"Клип не сохранён: {output_path}")

    logger.info(
        "Клип готов: %s (%.1f МБ)",
        output_path, os.path.getsize(output_path) / 1_048_576,
    )
    return output_path
