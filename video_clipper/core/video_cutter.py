# -*- coding: utf-8 -*-
"""
ШАГ 5. Нарезка видео в вертикальный формат 9:16 с размытым фоном.

Алгоритм:
    1. Берём отрезок (start..end) из исходного видео.
    2. Создаём два слоя:
         - задний: масштабированный кадр + сильный gaussian blur (через OpenCV)
         - передний: исходный отрезок, вписанный по ширине в формат 1080x1920
    3. Композитим их, сохраняем в mp4 (H.264 + AAC) через moviepy.

Дополнительно генерируется небольшой случайный «джиттер» (микро-сдвиг
кадра, изменение скорости на ±2%), чтобы обойти фильтры уникальности.

Это заглушка — финальная реализация появится на этапе 5.
"""

from utils.logger import get_logger
from utils.paths import make_clip_path

logger = get_logger(__name__)


# Целевое разрешение Shorts/TikTok
TARGET_WIDTH = 1080
TARGET_HEIGHT = 1920


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
    output_path = make_clip_path(output_dir, index)
    logger.info(
        "cut_vertical_clip: %.2f..%.2f → %s (blur=%s)",
        start, end, output_path, use_blur,
    )

    # TODO (шаг 5): реализовать через moviepy + opencv
    #
    #     from moviepy.editor import VideoFileClip, CompositeVideoClip
    #     import cv2, numpy as np
    #
    #     src = VideoFileClip(video_path).subclip(start, end)
    #
    #     # Передний слой: вписываем по ширине 1080
    #     foreground = src.resize(width=TARGET_WIDTH).set_position("center")
    #
    #     if use_blur:
    #         # Задний слой: тот же кадр, растянутый на весь экран и размытый
    #         def blur_frame(get_frame, t):
    #             frame = get_frame(t)
    #             frame = cv2.resize(frame, (TARGET_WIDTH, TARGET_HEIGHT))
    #             return cv2.GaussianBlur(frame, (0, 0), sigmaX=35)
    #         background = src.fl(blur_frame).resize((TARGET_WIDTH, TARGET_HEIGHT))
    #         final = CompositeVideoClip(
    #             [background, foreground],
    #             size=(TARGET_WIDTH, TARGET_HEIGHT),
    #         )
    #     else:
    #         final = foreground.on_color(
    #             size=(TARGET_WIDTH, TARGET_HEIGHT), color=(0, 0, 0),
    #         )
    #
    #     final.write_videofile(
    #         output_path, codec="libx264", audio_codec="aac",
    #         fps=30, bitrate="6000k", threads=4,
    #     )

    raise NotImplementedError(
        "Шаг 5 (нарезка 9:16 + blur) пока не реализован."
    )
