# -*- coding: utf-8 -*-
"""Утилиты для работы с путями (генерация имён клипов и т. п.)."""

import os
import re


def safe_filename(text: str, max_length: int = 60) -> str:
    """
    Приводит произвольную строку к виду, безопасному для имени файла:
    оставляет буквы/цифры/подчёркивания, обрезает лишнюю длину.
    """
    cleaned = re.sub(r"[^\w\-\.]+", "_", text, flags=re.UNICODE)
    cleaned = cleaned.strip("_")
    return cleaned[:max_length] or "clip"


def make_clip_path(output_dir: str, index: int, suffix: str = "") -> str:
    """Возвращает путь вида <output_dir>/short_001[_suffix].mp4."""
    os.makedirs(output_dir, exist_ok=True)
    base_name = f"short_{index:03d}"
    if suffix:
        base_name += "_" + safe_filename(suffix, max_length=30)
    return os.path.join(output_dir, base_name + ".mp4")
