# -*- coding: utf-8 -*-
"""
Кастомные виджеты для интерфейса Video Clipper.

Здесь собраны переиспользуемые компоненты:
- SectionFrame: карточка с заголовком и содержимым;
- LabeledEntry: поле ввода с подписью сверху;
- StatusBar: нижняя строка состояния.
"""

import customtkinter as ctk

from gui import theme


class SectionFrame(ctk.CTkFrame):
    """Карточка-секция с тёмным фоном, заголовком и отступами."""

    def __init__(self, master, title: str, **kwargs):
        # Передаём в родительский CTkFrame настройки внешнего вида карточки
        super().__init__(
            master,
            fg_color=theme.BG_SECONDARY,
            corner_radius=theme.RADIUS_LARGE,
            **kwargs,
        )

        # Заголовок секции (например, "1. Выбор видео")
        self.title_label = ctk.CTkLabel(
            self,
            text=title,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SUBTITLE, "bold"),
            text_color=theme.TEXT_PRIMARY,
            anchor="w",
        )
        self.title_label.pack(fill="x", padx=18, pady=(16, 8))

        # Контейнер для содержимого секции — добавляется снаружи
        self.body = ctk.CTkFrame(self, fg_color="transparent")
        self.body.pack(fill="both", expand=True, padx=18, pady=(0, 16))


class LabeledEntry(ctk.CTkFrame):
    """Поле ввода с подписью сверху и подсказкой."""

    def __init__(
        self,
        master,
        label_text: str,
        placeholder: str = "",
        **kwargs,
    ):
        super().__init__(master, fg_color="transparent", **kwargs)

        # Подпись (например: "Ключевые слова через запятую")
        self.label = ctk.CTkLabel(
            self,
            text=label_text,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SMALL),
            text_color=theme.TEXT_SECONDARY,
            anchor="w",
        )
        self.label.pack(fill="x", pady=(0, 4))

        # Само поле ввода
        self.entry = ctk.CTkEntry(
            self,
            placeholder_text=placeholder,
            fg_color=theme.BG_TERTIARY,
            border_color=theme.BG_TERTIARY,
            border_width=1,
            corner_radius=theme.RADIUS_SMALL,
            text_color=theme.TEXT_PRIMARY,
            placeholder_text_color=theme.TEXT_MUTED,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY),
            height=38,
        )
        self.entry.pack(fill="x")

    def get(self) -> str:
        """Возвращает введённый текст без лишних пробелов по краям."""
        return self.entry.get().strip()

    def set(self, value: str) -> None:
        """Программно устанавливает значение поля."""
        self.entry.delete(0, "end")
        self.entry.insert(0, value)


class StatusBar(ctk.CTkFrame):
    """Нижняя строка состояния — показывает текущий этап обработки."""

    def __init__(self, master, **kwargs):
        super().__init__(
            master,
            fg_color=theme.BG_SECONDARY,
            corner_radius=0,
            height=32,
            **kwargs,
        )
        # Левая метка — текст статуса
        self.text_label = ctk.CTkLabel(
            self,
            text="Готов к работе",
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SMALL),
            text_color=theme.TEXT_SECONDARY,
            anchor="w",
        )
        self.text_label.pack(side="left", padx=14, pady=4)

        # Правая метка — индикатор (например, "Whisper: не загружен")
        self.indicator_label = ctk.CTkLabel(
            self,
            text="●",
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY),
            text_color=theme.TEXT_MUTED,
        )
        self.indicator_label.pack(side="right", padx=14, pady=4)

    def set_status(self, text: str, color: str = theme.TEXT_SECONDARY) -> None:
        """Обновляет надпись и её цвет."""
        self.text_label.configure(text=text, text_color=color)

    def set_indicator(self, color: str) -> None:
        """Меняет цвет круглого индикатора справа."""
        self.indicator_label.configure(text_color=color)
