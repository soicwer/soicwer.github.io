# -*- coding: utf-8 -*-
"""
Общий модуль логирования.

Каждый файл получает свой логгер через `get_logger(__name__)`.
Все сообщения пишутся в консоль с указанием модуля и уровня.
"""

import logging
import sys

# Формат вывода: 12:34:56 | INFO     | gui.app | сообщение
_LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
_DATE_FORMAT = "%H:%M:%S"


def _configure_root_once() -> None:
    """Настраивает корневой логгер один раз за запуск приложения."""
    root = logging.getLogger()
    if root.handlers:
        # Уже настроено — повторно не трогаем
        return

    root.setLevel(logging.INFO)
    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(logging.Formatter(_LOG_FORMAT, datefmt=_DATE_FORMAT))
    root.addHandler(handler)


def get_logger(name: str) -> logging.Logger:
    """Возвращает настроенный логгер с заданным именем модуля."""
    _configure_root_once()
    return logging.getLogger(name)
