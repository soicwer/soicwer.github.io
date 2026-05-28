# -*- coding: utf-8 -*-
"""
ШАГ 6. Наложение рекламного PNG-баннера на готовый клип.

Поведение:
    1. Открываем готовый клип (это уже вертикальный 1080x1920 mp4).
    2. Открываем PNG-баннер с альфа-каналом.
    3. Масштабируем баннер до width_ratio * ширина клипа.
    4. Размещаем сверху или снизу с отступом margin_px.
    5. Перезаписываем клип финальной версией с баннером.

При ошибке (например, повреждённый PNG) клип остаётся без баннера —
ошибка пишется в лог и пробрасывается выше, чтобы GUI её показал.
"""

import os
import shutil

from utils.logger import get_logger

logger = get_logger(__name__)


def _import_moviepy():
    """Ленивая загрузка moviepy с поддержкой v1 и v2 API."""
    try:
        from moviepy.editor import (
            VideoFileClip, ImageClip, CompositeVideoClip,
        )
        return VideoFileClip, ImageClip, CompositeVideoClip
    except ImportError:
        from moviepy import (  # type: ignore
            VideoFileClip, ImageClip, CompositeVideoClip,
        )
        return VideoFileClip, ImageClip, CompositeVideoClip


def overlay_banner(
    clip_path: str,
    banner_path: str,
    position: str = "снизу",
    margin_px: int = 80,
    width_ratio: float = 0.9,
) -> str:
    """
    Накладывает PNG-баннер на готовый клип.

    Параметры:
        clip_path:   путь к готовому mp4-клипу;
        banner_path: путь к PNG-баннеру (желательно с альфа-каналом);
        position:    "снизу" / "сверху";
        margin_px:   отступ от края экрана в пикселях;
        width_ratio: какую долю ширины клипа занимает баннер (0..1).

    Возвращает:
        путь к итоговому клипу (тот же, что и входной — файл перезаписывается).
    """
    if not os.path.isfile(clip_path):
        raise FileNotFoundError(f"Клип не найден: {clip_path}")
    if not os.path.isfile(banner_path):
        raise FileNotFoundError(f"Баннер не найден: {banner_path}")

    logger.info(
        "Накладываю баннер: %s + %s (%s, отступ %d px)",
        clip_path, banner_path, position, margin_px,
    )

    VideoFileClip, ImageClip, CompositeVideoClip = _import_moviepy()

    # Пишем во временный файл рядом, потом подменяем оригинал.
    base, ext = os.path.splitext(clip_path)
    tmp_path = base + ".banner_tmp" + ext

    with VideoFileClip(clip_path) as video:
        target_w = int(video.w * width_ratio)
        banner = (
            ImageClip(banner_path)
            .resize(width=target_w)
            .set_duration(video.duration)
        )

        if position == "сверху":
            banner = banner.set_position(("center", margin_px))
        else:  # по умолчанию — снизу
            y = max(0, video.h - banner.h - margin_px)
            banner = banner.set_position(("center", y))

        composite = CompositeVideoClip([video, banner], size=(video.w, video.h))
        composite = composite.set_audio(video.audio)

        composite.write_videofile(
            tmp_path,
            codec="libx264",
            audio_codec="aac",
            fps=video.fps or 30,
            bitrate="6000k",
            preset="medium",
            threads=4,
            temp_audiofile=base + ".banner_audio.m4a",
            remove_temp=True,
            logger=None,
        )
        composite.close()
        banner.close()

    # Заменяем исходный клип результатом
    shutil.move(tmp_path, clip_path)
    logger.info("Баннер добавлен: %s", clip_path)
    return clip_path
