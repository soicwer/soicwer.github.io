# -*- coding: utf-8 -*-
"""
Точка входа в приложение Video Clipper.

Запускает главное окно графического интерфейса.
Запуск из терминала:
    python main.py
"""

from gui.app import VideoClipperApp


def main() -> None:
    """Создаёт экземпляр главного окна и запускает основной цикл Tkinter."""
    application = VideoClipperApp()
    application.mainloop()


if __name__ == "__main__":
    main()
