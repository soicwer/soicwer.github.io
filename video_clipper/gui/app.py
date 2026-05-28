# -*- coding: utf-8 -*-
"""
Главное окно приложения Video Clipper.

Реализует ШАГ 1 из ТЗ:
    - окно выбора видеофайла (mp4/mkv/avi/mov),
    - поле для ввода ключевых слов,
    - выбор папки для сохранения готовых клипов,
    - выбор баннера (опционально),
    - выбор размера модели Whisper,
    - кнопка запуска обработки,
    - красивый прогресс-бар,
    - лог выполнения.

Реальная обработка видео (шаги 2–6) пока представлена заглушками
из пакета `core/` и будет реализована в следующих этапах.
"""

import os
import subprocess
import sys
import threading
from tkinter import filedialog

import customtkinter as ctk

from gui import theme
from gui.widgets import LabeledEntry, SectionFrame, StatusBar
from utils.config import AppConfig
from utils.logger import get_logger

logger = get_logger(__name__)


# CustomTkinter поддерживает два режима — тёмный и светлый. Фиксируем тёмный.
ctk.set_appearance_mode("dark")
# Базовая цветовая тема библиотеки (мы дополнительно перекрашиваем виджеты).
ctk.set_default_color_theme("blue")


class VideoClipperApp(ctk.CTk):
    """Главное окно приложения. Наследует класс CTk (аналог Tk)."""

    def __init__(self) -> None:
        super().__init__()

        # ---- Настройки приложения (хранит выбранные пути и параметры) ----
        self.config_state = AppConfig()

        # ---- Параметры окна ----
        self.title("Video Clipper — автонарезка Shorts из длинных видео")
        self.geometry(f"{theme.WINDOW_WIDTH}x{theme.WINDOW_HEIGHT}")
        self.minsize(theme.WINDOW_MIN_WIDTH, theme.WINDOW_MIN_HEIGHT)
        self.configure(fg_color=theme.BG_PRIMARY)

        # Сетка главного окна: одна растягивающаяся колонка и
        # несколько строк (заголовок, контент, прогресс, статус-бар).
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Сборка интерфейса по частям
        self._build_header()
        self._build_content()
        self._build_progress()
        self._build_status_bar()

        # Флаг, чтобы запретить повторный запуск обработки во время работы
        self._processing = False

    # ==================================================================
    #                           СБОРКА UI
    # ==================================================================

    def _build_header(self) -> None:
        """Верхняя шапка окна: название приложения и подзаголовок."""
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.grid(row=0, column=0, sticky="ew", padx=24, pady=(20, 8))
        header.grid_columnconfigure(0, weight=1)

        title = ctk.CTkLabel(
            header,
            text="🎬  Video Clipper",
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_TITLE, "bold"),
            text_color=theme.TEXT_PRIMARY,
            anchor="w",
        )
        title.grid(row=0, column=0, sticky="w")

        subtitle = ctk.CTkLabel(
            header,
            text="Автоматическая нарезка вертикальных Shorts из длинных видео",
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SUBTITLE),
            text_color=theme.TEXT_SECONDARY,
            anchor="w",
        )
        subtitle.grid(row=1, column=0, sticky="w", pady=(2, 0))

    def _build_content(self) -> None:
        """Центральная часть: секции выбора видео, параметров и логов."""
        content = ctk.CTkFrame(self, fg_color="transparent")
        content.grid(row=1, column=0, sticky="nsew", padx=24, pady=8)

        # Две колонки одинаковой ширины: слева — параметры, справа — лог
        content.grid_columnconfigure(0, weight=1, uniform="cols")
        content.grid_columnconfigure(1, weight=1, uniform="cols")
        content.grid_rowconfigure(0, weight=1)

        # ---------- Левая колонка: входные параметры ----------
        left = ctk.CTkFrame(content, fg_color="transparent")
        left.grid(row=0, column=0, sticky="nsew", padx=(0, 8))
        left.grid_columnconfigure(0, weight=1)

        self._build_input_section(left)
        self._build_params_section(left)

        # ---------- Правая колонка: лог обработки ----------
        right = ctk.CTkFrame(content, fg_color="transparent")
        right.grid(row=0, column=1, sticky="nsew", padx=(8, 0))
        right.grid_columnconfigure(0, weight=1)
        right.grid_rowconfigure(0, weight=1)

        self._build_log_section(right)

    def _build_input_section(self, parent) -> None:
        """Секция: выбор видеофайла, папки вывода и (опционально) баннера."""
        section = SectionFrame(parent, title="1. Источник и вывод")
        section.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        parent.grid_rowconfigure(0, weight=0)

        # --- Видеофайл ---
        video_label = ctk.CTkLabel(
            section.body,
            text="Видеофайл (mp4 / mkv / mov / avi)",
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SMALL),
            text_color=theme.TEXT_SECONDARY,
            anchor="w",
        )
        video_label.pack(fill="x", pady=(0, 4))

        video_row = ctk.CTkFrame(section.body, fg_color="transparent")
        video_row.pack(fill="x")

        self.video_path_var = ctk.StringVar(value="")
        video_entry = ctk.CTkEntry(
            video_row,
            textvariable=self.video_path_var,
            placeholder_text="Файл не выбран…",
            fg_color=theme.BG_TERTIARY,
            border_color=theme.BG_TERTIARY,
            corner_radius=theme.RADIUS_SMALL,
            text_color=theme.TEXT_PRIMARY,
            placeholder_text_color=theme.TEXT_MUTED,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY),
            height=38,
            state="readonly",
        )
        video_entry.pack(side="left", fill="x", expand=True, padx=(0, 8))

        video_button = ctk.CTkButton(
            video_row,
            text="Обзор…",
            width=110,
            height=38,
            corner_radius=theme.RADIUS_SMALL,
            fg_color=theme.ACCENT,
            hover_color=theme.ACCENT_HOVER,
            text_color=theme.TEXT_PRIMARY,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY, "bold"),
            command=self._on_pick_video,
        )
        video_button.pack(side="left")

        # --- Папка вывода ---
        out_label = ctk.CTkLabel(
            section.body,
            text="Папка для готовых клипов",
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SMALL),
            text_color=theme.TEXT_SECONDARY,
            anchor="w",
        )
        out_label.pack(fill="x", pady=(12, 4))

        out_row = ctk.CTkFrame(section.body, fg_color="transparent")
        out_row.pack(fill="x")

        self.output_dir_var = ctk.StringVar(value="")
        out_entry = ctk.CTkEntry(
            out_row,
            textvariable=self.output_dir_var,
            placeholder_text="Папка не выбрана…",
            fg_color=theme.BG_TERTIARY,
            border_color=theme.BG_TERTIARY,
            corner_radius=theme.RADIUS_SMALL,
            text_color=theme.TEXT_PRIMARY,
            placeholder_text_color=theme.TEXT_MUTED,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY),
            height=38,
            state="readonly",
        )
        out_entry.pack(side="left", fill="x", expand=True, padx=(0, 8))

        out_button = ctk.CTkButton(
            out_row,
            text="Выбрать…",
            width=110,
            height=38,
            corner_radius=theme.RADIUS_SMALL,
            fg_color=theme.ACCENT,
            hover_color=theme.ACCENT_HOVER,
            text_color=theme.TEXT_PRIMARY,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY, "bold"),
            command=self._on_pick_output_dir,
        )
        out_button.pack(side="left")

        # --- Баннер (PNG с прозрачностью, необязательно) ---
        banner_label = ctk.CTkLabel(
            section.body,
            text="Рекламный баннер PNG (необязательно)",
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SMALL),
            text_color=theme.TEXT_SECONDARY,
            anchor="w",
        )
        banner_label.pack(fill="x", pady=(12, 4))

        banner_row = ctk.CTkFrame(section.body, fg_color="transparent")
        banner_row.pack(fill="x")

        self.banner_path_var = ctk.StringVar(value="")
        banner_entry = ctk.CTkEntry(
            banner_row,
            textvariable=self.banner_path_var,
            placeholder_text="Без баннера",
            fg_color=theme.BG_TERTIARY,
            border_color=theme.BG_TERTIARY,
            corner_radius=theme.RADIUS_SMALL,
            text_color=theme.TEXT_PRIMARY,
            placeholder_text_color=theme.TEXT_MUTED,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY),
            height=38,
            state="readonly",
        )
        banner_entry.pack(side="left", fill="x", expand=True, padx=(0, 8))

        banner_button = ctk.CTkButton(
            banner_row,
            text="Выбрать…",
            width=110,
            height=38,
            corner_radius=theme.RADIUS_SMALL,
            fg_color=theme.BG_TERTIARY,
            hover_color=theme.ACCENT_HOVER,
            text_color=theme.TEXT_PRIMARY,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY),
            command=self._on_pick_banner,
        )
        banner_button.pack(side="left")

    def _build_params_section(self, parent) -> None:
        """Секция: ключевые слова, длительность клипа, модель Whisper."""
        section = SectionFrame(parent, title="2. Параметры обработки")
        section.grid(row=1, column=0, sticky="nsew", pady=(0, 10))
        parent.grid_rowconfigure(1, weight=1)

        # --- Ключевые слова / триггеры ---
        self.keywords_entry = LabeledEntry(
            section.body,
            label_text="Ключевые слова / триггеры (через запятую)",
            placeholder="смех, шок, неожиданно, аплодисменты",
        )
        self.keywords_entry.pack(fill="x", pady=(0, 10))

        # --- Длительность клипа: два поля бок о бок ---
        durations_row = ctk.CTkFrame(section.body, fg_color="transparent")
        durations_row.pack(fill="x", pady=(0, 10))
        durations_row.grid_columnconfigure(0, weight=1)
        durations_row.grid_columnconfigure(1, weight=1)

        self.min_duration_entry = LabeledEntry(
            durations_row,
            label_text="Мин. длина клипа, сек",
            placeholder="60",
        )
        self.min_duration_entry.set("60")
        self.min_duration_entry.grid(row=0, column=0, sticky="ew", padx=(0, 8))

        self.max_duration_entry = LabeledEntry(
            durations_row,
            label_text="Макс. длина клипа, сек (≈1.5 мин)",
            placeholder="90",
        )
        self.max_duration_entry.set("90")
        self.max_duration_entry.grid(row=0, column=1, sticky="ew", padx=(8, 0))

        # --- Модель Whisper и позиция баннера ---
        options_row = ctk.CTkFrame(section.body, fg_color="transparent")
        options_row.pack(fill="x", pady=(0, 10))
        options_row.grid_columnconfigure(0, weight=1)
        options_row.grid_columnconfigure(1, weight=1)

        # Подпись для модели Whisper
        whisper_label = ctk.CTkLabel(
            options_row,
            text="Модель Whisper",
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SMALL),
            text_color=theme.TEXT_SECONDARY,
            anchor="w",
        )
        whisper_label.grid(row=0, column=0, sticky="w", pady=(0, 4))

        # Подпись для позиции баннера
        banner_pos_label = ctk.CTkLabel(
            options_row,
            text="Положение баннера",
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SMALL),
            text_color=theme.TEXT_SECONDARY,
            anchor="w",
        )
        banner_pos_label.grid(row=0, column=1, sticky="w", pady=(0, 4), padx=(16, 0))

        # Выпадающий список моделей Whisper. tiny — быстрее всего, large — точнее.
        self.whisper_model_var = ctk.StringVar(value="small")
        whisper_menu = ctk.CTkOptionMenu(
            options_row,
            values=["tiny", "base", "small", "medium", "large"],
            variable=self.whisper_model_var,
            fg_color=theme.BG_TERTIARY,
            button_color=theme.ACCENT,
            button_hover_color=theme.ACCENT_HOVER,
            text_color=theme.TEXT_PRIMARY,
            dropdown_fg_color=theme.BG_TERTIARY,
            dropdown_text_color=theme.TEXT_PRIMARY,
            dropdown_hover_color=theme.ACCENT,
            corner_radius=theme.RADIUS_SMALL,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY),
            height=38,
        )
        whisper_menu.grid(row=1, column=0, sticky="ew", padx=(0, 8))

        # Выпадающий список позиций баннера
        self.banner_position_var = ctk.StringVar(value="снизу")
        banner_pos_menu = ctk.CTkOptionMenu(
            options_row,
            values=["снизу", "сверху", "не накладывать"],
            variable=self.banner_position_var,
            fg_color=theme.BG_TERTIARY,
            button_color=theme.ACCENT,
            button_hover_color=theme.ACCENT_HOVER,
            text_color=theme.TEXT_PRIMARY,
            dropdown_fg_color=theme.BG_TERTIARY,
            dropdown_text_color=theme.TEXT_PRIMARY,
            dropdown_hover_color=theme.ACCENT,
            corner_radius=theme.RADIUS_SMALL,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY),
            height=38,
        )
        banner_pos_menu.grid(row=1, column=1, sticky="ew", padx=(8, 0))

        # --- Чекбокс blur-фона (вертикальный 9:16) ---
        self.use_blur_var = ctk.BooleanVar(value=True)
        blur_checkbox = ctk.CTkCheckBox(
            section.body,
            text="Размытый фон 9:16 (для обхода фильтров уникальности)",
            variable=self.use_blur_var,
            fg_color=theme.ACCENT,
            hover_color=theme.ACCENT_HOVER,
            text_color=theme.TEXT_PRIMARY,
            border_color=theme.TEXT_MUTED,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY),
        )
        blur_checkbox.pack(anchor="w", pady=(6, 0))

    def _build_log_section(self, parent) -> None:
        """Правая колонка: текстовое поле с логами обработки."""
        section = SectionFrame(parent, title="Журнал выполнения")
        section.grid(row=0, column=0, sticky="nsew")
        parent.grid_rowconfigure(0, weight=1)

        # Многострочное поле для логов. Read-only с программной вставкой.
        self.log_textbox = ctk.CTkTextbox(
            section.body,
            fg_color=theme.BG_TERTIARY,
            text_color=theme.TEXT_PRIMARY,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SMALL),
            corner_radius=theme.RADIUS_SMALL,
            wrap="word",
        )
        self.log_textbox.pack(fill="both", expand=True)
        self.log_textbox.configure(state="disabled")

        # Сразу приветственное сообщение
        self._append_log(
            "Добро пожаловать! Выберите видеофайл, ключевые слова и нажмите «Запустить».\n"
        )

    def _build_progress(self) -> None:
        """Прогресс-бар и кнопка запуска под основным содержимым."""
        progress_panel = ctk.CTkFrame(self, fg_color="transparent")
        progress_panel.grid(row=2, column=0, sticky="ew", padx=24, pady=(8, 12))
        progress_panel.grid_columnconfigure(0, weight=1)

        # Подпись текущего этапа
        self.stage_label = ctk.CTkLabel(
            progress_panel,
            text="Ожидание запуска…",
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_SMALL),
            text_color=theme.TEXT_SECONDARY,
            anchor="w",
        )
        self.stage_label.grid(row=0, column=0, sticky="ew", pady=(0, 6))

        # Сам прогресс-бар (CTkProgressBar принимает значение 0…1).
        self.progress_bar = ctk.CTkProgressBar(
            progress_panel,
            height=14,
            corner_radius=theme.RADIUS_SMALL,
            fg_color=theme.BG_TERTIARY,
            progress_color=theme.ACCENT,
        )
        self.progress_bar.grid(row=1, column=0, sticky="ew", padx=(0, 12))
        self.progress_bar.set(0.0)

        # Кнопка запуска — справа от прогресс-бара
        self.start_button = ctk.CTkButton(
            progress_panel,
            text="▶  Запустить",
            width=160,
            height=42,
            corner_radius=theme.RADIUS_MEDIUM,
            fg_color=theme.ACCENT,
            hover_color=theme.ACCENT_HOVER,
            text_color=theme.TEXT_PRIMARY,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY, "bold"),
            command=self._on_start,
        )
        self.start_button.grid(row=0, column=1, rowspan=2, sticky="e", padx=(12, 0))

        # Кнопка «Открыть папку с готовыми клипами» — для быстрого доступа
        self.open_folder_button = ctk.CTkButton(
            progress_panel,
            text="📂  Открыть папку",
            width=160,
            height=42,
            corner_radius=theme.RADIUS_MEDIUM,
            fg_color=theme.BG_TERTIARY,
            hover_color=theme.ACCENT_HOVER,
            text_color=theme.TEXT_PRIMARY,
            font=(theme.FONT_FAMILY, theme.FONT_SIZE_BODY),
            command=self._on_open_output_dir,
        )
        self.open_folder_button.grid(row=0, column=2, rowspan=2, sticky="e", padx=(8, 0))

    def _build_status_bar(self) -> None:
        """Нижняя строка состояния."""
        self.status_bar = StatusBar(self)
        self.status_bar.grid(row=3, column=0, sticky="ew")
        self.status_bar.set_indicator(theme.SUCCESS)

    # ==================================================================
    #                       ОБРАБОТЧИКИ СОБЫТИЙ
    # ==================================================================

    def _on_pick_video(self) -> None:
        """Открывает системный диалог выбора видеофайла."""
        # filetypes — фильтры, которые увидит пользователь в диалоге
        filetypes = [
            ("Видео файлы", "*.mp4 *.mkv *.mov *.avi *.webm"),
            ("Все файлы", "*.*"),
        ]
        path = filedialog.askopenfilename(
            title="Выберите исходное видео",
            filetypes=filetypes,
        )
        # Пустая строка означает, что пользователь нажал «Отмена»
        if not path:
            return

        if not self._validate_video_file(path):
            return

        self.config_state.video_path = path
        self.video_path_var.set(path)
        self._append_log(f"✓ Выбрано видео: {os.path.basename(path)}\n")

        # Автоматически предлагаем папку вывода рядом с исходным файлом
        if not self.output_dir_var.get():
            default_out = os.path.join(os.path.dirname(path), "shorts_output")
            self.output_dir_var.set(default_out)
            self.config_state.output_dir = default_out
            self._append_log(f"  Папка вывода по умолчанию: {default_out}\n")

        self.status_bar.set_status(
            f"Видео загружено: {os.path.basename(path)}",
            color=theme.SUCCESS,
        )

    def _on_pick_output_dir(self) -> None:
        """Открывает диалог выбора папки для сохранения готовых клипов."""
        path = filedialog.askdirectory(title="Выберите папку для готовых Shorts")
        if not path:
            return
        self.config_state.output_dir = path
        self.output_dir_var.set(path)
        self._append_log(f"✓ Папка вывода: {path}\n")

    def _on_pick_banner(self) -> None:
        """Открывает диалог выбора PNG-баннера."""
        filetypes = [("Изображения PNG", "*.png"), ("Все файлы", "*.*")]
        path = filedialog.askopenfilename(
            title="Выберите рекламный баннер",
            filetypes=filetypes,
        )
        if not path:
            return
        self.config_state.banner_path = path
        self.banner_path_var.set(path)
        self._append_log(f"✓ Баннер: {os.path.basename(path)}\n")

    def _on_open_output_dir(self) -> None:
        """Открывает папку с готовыми клипами в системном файловом менеджере."""
        path = self.output_dir_var.get().strip()
        if not path:
            self._append_log("✗ Папка вывода ещё не выбрана.\n")
            return
        if not os.path.isdir(path):
            # Возможно папка ещё не создана — создадим
            try:
                os.makedirs(path, exist_ok=True)
            except OSError as exc:
                self._append_log(f"✗ Не удалось создать папку: {exc}\n")
                return
        try:
            if sys.platform.startswith("win"):
                os.startfile(path)  # type: ignore[attr-defined]
            elif sys.platform == "darwin":
                subprocess.Popen(["open", path])
            else:
                subprocess.Popen(["xdg-open", path])
        except Exception as exc:  # noqa: BLE001
            self._append_log(f"✗ Не удалось открыть папку: {exc}\n")

    def _probe_video_duration(self, video_path: str) -> float:
        """Возвращает длительность видео в секундах через moviepy."""
        try:
            try:
                from moviepy.editor import VideoFileClip
            except ImportError:
                from moviepy import VideoFileClip  # type: ignore
            with VideoFileClip(video_path) as clip:
                return float(clip.duration or 0.0)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Не удалось определить длительность: %s", exc)
            return 0.0

    def _on_start(self) -> None:
        """Запускает фоновую обработку видео в отдельном потоке."""
        if self._processing:
            self._append_log("⚠ Обработка уже идёт, дождитесь завершения.\n")
            return

        # ---- Валидация введённых параметров ----
        video_path = self.video_path_var.get().strip()
        if not video_path:
            self._append_log("✗ Сначала выберите видеофайл.\n")
            self.status_bar.set_status("Не выбран видеофайл", theme.DANGER)
            return
        if not os.path.isfile(video_path):
            self._append_log(f"✗ Файл не найден: {video_path}\n")
            return

        output_dir = self.output_dir_var.get().strip()
        if not output_dir:
            self._append_log("✗ Не выбрана папка для сохранения клипов.\n")
            return
        # Создаём папку, если её нет
        os.makedirs(output_dir, exist_ok=True)

        # Парсим длительности
        try:
            min_dur = int(self.min_duration_entry.get() or "30")
            max_dur = int(self.max_duration_entry.get() or "50")
        except ValueError:
            self._append_log("✗ Длительности должны быть целыми числами.\n")
            return
        if min_dur <= 0 or max_dur <= min_dur:
            self._append_log("✗ Проверьте: 0 < min < max.\n")
            return

        # Сохраняем все параметры в общий объект конфигурации
        self.config_state.video_path = video_path
        self.config_state.output_dir = output_dir
        self.config_state.banner_path = self.banner_path_var.get().strip() or None
        self.config_state.banner_position = self.banner_position_var.get()
        self.config_state.whisper_model = self.whisper_model_var.get()
        self.config_state.keywords = [
            word.strip().lower()
            for word in self.keywords_entry.get().split(",")
            if word.strip()
        ]
        self.config_state.min_clip_seconds = min_dur
        self.config_state.max_clip_seconds = max_dur
        self.config_state.use_blur_background = self.use_blur_var.get()

        # Блокируем кнопку и запускаем поток
        self._processing = True
        self.start_button.configure(state="disabled", text="⏳  Обработка…")
        self.progress_bar.set(0.0)
        self._append_log("\n=== Запуск обработки ===\n")

        worker = threading.Thread(target=self._process_video, daemon=True)
        worker.start()

    # ==================================================================
    #                       ОБРАБОТКА (в отдельном потоке)
    # ==================================================================

    def _process_video(self) -> None:
        """
        Выполняется в фоновом потоке.

        Здесь будут вызываться шаги 2–6 (audio_extractor, speech_analyzer,
        hype_finder, video_cutter, banner_overlay). Пока — заглушки,
        чтобы продемонстрировать работу прогресс-бара и лога.
        """
        try:
            # Импортируем заглушки только тут, чтобы окно открывалось мгновенно
            from core.audio_extractor import extract_audio
            from core.banner_overlay import overlay_banner
            from core.hype_finder import find_hype_moments
            from core.speech_analyzer import transcribe_audio
            from core.video_cutter import cut_vertical_clip

            cfg = self.config_state

            # ----- Шаг 1: Извлечение аудио -----
            self._update_progress(0.05, "Шаг 1/4: Извлечение аудиодорожки…")
            audio_path = extract_audio(cfg.video_path, cfg.output_dir)
            self._append_log(f"  → Аудио сохранено: {os.path.basename(audio_path)}\n")

            # Заодно узнаем длительность видео, чтобы корректно
            # ограничивать интервалы клипов в hype_finder.
            video_duration = self._probe_video_duration(cfg.video_path)
            self._append_log(f"  → Длительность видео: {video_duration:.1f} сек\n")

            # ----- Шаг 2: Транскрипция -----
            self._update_progress(0.20, "Шаг 2/4: Транскрипция речи (Whisper)…")
            segments = transcribe_audio(audio_path, model_name=cfg.whisper_model)
            self._append_log(f"  → Распознано сегментов: {len(segments)}\n")

            # Удаляем временный WAV — он больше не нужен
            try:
                os.remove(audio_path)
            except OSError:
                pass

            # ----- Шаг 3: Поиск хайповых моментов -----
            self._update_progress(0.55, "Шаг 3/4: Поиск интересных моментов…")
            moments = find_hype_moments(
                segments,
                keywords=cfg.keywords,
                min_seconds=cfg.min_clip_seconds,
                max_seconds=cfg.max_clip_seconds,
                video_duration=video_duration,
                max_clips=cfg.max_clips,
            )
            self._append_log(f"  → Будет нарезано клипов: {len(moments)}\n")
            if not moments:
                self._append_log(
                    "  ⚠ Не удалось найти ни одного подходящего фрагмента.\n"
                )
                self.after(0, lambda: self.status_bar.set_status(
                    "Не найдено фрагментов для нарезки", theme.WARNING,
                ))
                return

            # ----- Шаг 4: Нарезка + баннер -----
            total = len(moments)
            saved_paths: list[str] = []
            for idx, moment in enumerate(moments, start=1):
                # Прогресс растёт линейно от 0.60 до 1.00 по мере нарезки
                stage_progress = 0.60 + 0.40 * (idx - 1) / total
                duration = moment["end"] - moment["start"]
                self._update_progress(
                    stage_progress,
                    f"Шаг 4/4: Клип {idx}/{total} ({duration:.0f} сек)…",
                )

                clip_path = cut_vertical_clip(
                    video_path=cfg.video_path,
                    start=moment["start"],
                    end=moment["end"],
                    output_dir=cfg.output_dir,
                    index=idx,
                    use_blur=cfg.use_blur_background,
                )

                # Опциональный баннер
                if cfg.banner_path and cfg.banner_position != "не накладывать":
                    self._append_log(f"  → Накладываю баннер на клип {idx}…\n")
                    overlay_banner(
                        clip_path=clip_path,
                        banner_path=cfg.banner_path,
                        position=cfg.banner_position,
                    )

                saved_paths.append(clip_path)
                size_mb = os.path.getsize(clip_path) / 1_048_576
                self._append_log(
                    f"  ✓ Готов: {os.path.basename(clip_path)} ({size_mb:.1f} МБ)\n"
                )

            self._update_progress(1.0, f"Готово! Сохранено клипов: {len(saved_paths)}")
            self._append_log(
                f"\n✓ Все {len(saved_paths)} клипов сохранены в:\n   {cfg.output_dir}\n"
                "  Нажмите «Открыть папку», чтобы забрать готовые видео.\n"
            )
            self.after(0, lambda: self.status_bar.set_status(
                f"Готово: {len(saved_paths)} клипов в {cfg.output_dir}",
                theme.SUCCESS,
            ))

        except Exception as exc:  # noqa: BLE001 — показываем любую ошибку в логе
            logger.exception("Ошибка при обработке")
            message = str(exc)
            self._append_log(f"\n✗ Ошибка: {message}\n")
            self.after(0, lambda m=message: self.status_bar.set_status(
                f"Ошибка: {m}", theme.DANGER,
            ))

        finally:
            # В любом случае разблокируем кнопку запуска
            self.after(0, self._reset_after_processing)

    # ==================================================================
    #                       ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    # ==================================================================

    def _validate_video_file(self, path: str) -> bool:
        """Проверяет, что путь существует и имеет допустимое расширение."""
        if not os.path.isfile(path):
            self._append_log(f"✗ Файл не найден: {path}\n")
            return False
        allowed = (".mp4", ".mkv", ".mov", ".avi", ".webm")
        if not path.lower().endswith(allowed):
            self._append_log(
                f"✗ Неподдерживаемый формат. Разрешено: {', '.join(allowed)}\n"
            )
            return False
        return True

    def _append_log(self, message: str) -> None:
        """Добавляет строку в лог-окно из любого потока (через .after)."""
        def _do_append() -> None:
            self.log_textbox.configure(state="normal")
            self.log_textbox.insert("end", message)
            self.log_textbox.see("end")
            self.log_textbox.configure(state="disabled")

        # Если вызвано не из главного потока — переносим в главный через after
        self.after(0, _do_append)

    def _update_progress(self, value: float, stage_text: str) -> None:
        """Обновляет прогресс-бар и текст этапа (потокобезопасно)."""
        def _do_update() -> None:
            self.progress_bar.set(max(0.0, min(1.0, value)))
            self.stage_label.configure(text=stage_text)
            self.status_bar.set_status(stage_text, theme.TEXT_SECONDARY)

        self.after(0, _do_update)
        self._append_log(f"\n[{int(value * 100)}%] {stage_text}\n")

    def _reset_after_processing(self) -> None:
        """Возвращает кнопку запуска в исходное состояние."""
        self._processing = False
        self.start_button.configure(state="normal", text="▶  Запустить")
