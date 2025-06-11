from aiogram.fsm.state import StatesGroup, State


class Admin(StatesGroup):
    create_mailling = State()
    confirm_mailling_name = State()
    input_mailling_desc = State()
    confirm_mailling_desc = State()
    is_need_photo = State()
    get_photo = State()
    confirm_photo = State()