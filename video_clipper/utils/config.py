# -*- coding: utf-8 -*-
"""
Объект конфигурации приложения.

Хранит текущие выбранные пользователем параметры:
    - путь к видео,
    - папку вывода,
    - ключевые слова,
    - параметры нарезки,
    - модель Whisper,
    - путь и позицию баннера.
"""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class AppConfig:
    """Контейнер с параметрами, которые передаются между шагами обработки."""

    # --- Источник и вывод ---
    video_path: str = ""                 # Путь к исходному видео
    output_dir: str = ""                 # Папка, куда сохранять готовые клипы

    # --- Параметры нарезки ---
    min_clip_seconds: int = 30           # Минимальная длительность одного Shorts
    max_clip_seconds: int = 50           # Максимальная длительность
    use_blur_background: bool = True     # Размытый фон в формате 9:16

    # --- Поиск хайповых моментов ---
    keywords: List[str] = field(default_factory=list)  # Список триггерных слов

    # --- Whisper ---
    whisper_model: str = "small"         # tiny / base / small / medium / large

    # --- Баннер ---
    banner_path: Optional[str] = None    # Путь к PNG с прозрачностью
    banner_position: str = "снизу"       # "снизу" / "сверху" / "не накладывать"
