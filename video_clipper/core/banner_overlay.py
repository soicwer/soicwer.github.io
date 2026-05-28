# -*- coding: utf-8 -*-
"""
ШАГ 6. Наложение рекламного PNG-баннера на готовый клип.

Алгоритм:
    1. Открываем готовый клип через moviepy (VideoFileClip).
    2. Открываем PNG-баннер через ImageClip с сохранением прозрачности.
    3. Масштабируем баннер по ширине (например, 90% от ширины клипа).
    4. Размещаем сверху или снизу с отступом ~80 пикселей.
    5. Сохраняем результат поверх исходного файла или с суффиксом _ads.

Это заглушка — финальная реализация появится на этапе 6.
"""

from utils.logger import get_logger

logger = get_logger(__name__)


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
        banner_path: путь к PNG-баннеру (с альфа-каналом);
        position:    "снизу" / "сверху";
        margin_px:   отступ от края экрана в пикселях;
        width_ratio: какую долю ширины клипа занимает баннер (0..1).

    Возвращает:
        путь к итоговому клипу с баннером.
    """
    logger.info(
        "overlay_banner: %s + %s (%s, %d px)",
        clip_path, banner_path, position, margin_px,
    )

    # TODO (шаг 6): реализовать через moviepy
    #
    #     from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip
    #
    #     video = VideoFileClip(clip_path)
    #     target_w = int(video.w * width_ratio)
    #     banner = (
    #         ImageClip(banner_path)
    #         .resize(width=target_w)
    #         .set_duration(video.duration)
    #     )
    #     if position == "снизу":
    #         banner = banner.set_position(("center", video.h - banner.h - margin_px))
    #     else:  # "сверху"
    #         banner = banner.set_position(("center", margin_px))
    #
    #     final = CompositeVideoClip([video, banner])
    #     final.write_videofile(
    #         clip_path,                # перезапись исходного клипа
    #         codec="libx264",
    #         audio_codec="aac",
    #         fps=video.fps,
    #     )

    raise NotImplementedError(
        "Шаг 6 (наложение баннера) пока не реализован."
    )
