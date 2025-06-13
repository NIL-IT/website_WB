from aiogram import types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton


def get_cancel_btns(sizes: tuple[int, ...] = (2,)):
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text='Отмена', callback_data='cancel')

    return keyboard.adjust(*sizes).as_markup()


def getKeyboardConfirm():
    keyboard = InlineKeyboardBuilder()
    keyboard.add(types.InlineKeyboardButton(text='Верно', callback_data='yes'))
    keyboard.add(types.InlineKeyboardButton(text='Неверно', callback_data='no'))
    keyboard.adjust(2)

    return keyboard.as_markup()


def get_is_need_photo_btns(sizes: tuple[int, ...] = (2,)):
    keyboard = InlineKeyboardBuilder()
    keyboard.add(types.InlineKeyboardButton(text='Да', callback_data='yes'))
    keyboard.add(types.InlineKeyboardButton(text='Нет', callback_data='no'))

    return keyboard.adjust(*sizes).as_markup()

admin_corect_all = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Провести рассылку", callback_data="mailing_done_all")],
    [InlineKeyboardButton(text="Отменить", callback_data="admin")],
]) 

def mailing_button(but_text):
    but = InlineKeyboardBuilder()
    but.button(text= but_text, web_app=WebAppInfo(url="https://inhomeka.online/catalog"))
    but.adjust(1)
    return but.as_markup()


################

get_btn_mailing = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Добавить свою ссылку", callback_data="btn_mailing_castom")],
    [InlineKeyboardButton(text="Оставить ссылку на WebApp", callback_data="btn_mailing_defolte")],
]) 

def mailing_castom_button(but_text,link):
    but = InlineKeyboardBuilder()
    but.button(text= but_text, url=f'{link}')
    but.adjust(1)
    return but.as_markup()

def payments_btn():
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text='Открыть', web_app=WebAppInfo(url='https://inhomeka.online:83/'))
    return keyboard.adjust(1).as_markup()

def get_start_btns_admin():
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text='🛁 Готовые комплекты бренда', url='https://inhomeka.ru/?utm_source=tg&utm_medium=club&utm_campaign=main')
    keyboard.button(text='📚 Каталог товаров с кэшбэком', web_app=WebAppInfo(url='https://inhomeka.online/catalog'))
    keyboard.button(text='🛒 Мои покупки', web_app=WebAppInfo(url='https://inhomeka.online/purchases'))
    keyboard.button(text='👭 Поделиться с другом', callback_data='referal')
    keyboard.button(text='❓Частые вопросы ', url='https://telegra.ph/O-servise-06-21')
    keyboard.button(text='📩Обратная связь и поддержка', url='https://t.me/razdadim5')
    keyboard.button(text='🏆 Мой статус', web_app=WebAppInfo(url='https://inhomeka.online/profile'))
    keyboard.button(text='🛍️Разместить товар', web_app=WebAppInfo(url='https://telegra.ph/Instrukciya-razmeshcheniya-06-21'))
    keyboard.button(text='💰Оплатить товар', web_app=WebAppInfo(url='https://telegra.ph/Instrukciya-razmeshcheniya-06-21'))
    keyboard.button(text='🔎Модерация', web_app=WebAppInfo(url='https://telegra.ph/Instrukciya-razmeshcheniya-06-21'))
    keyboard.button(text='📱Наши социальные сети', callback_data='subskr')
    return keyboard.adjust(1).as_markup()


keyboard_otchet = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Скачать отчет", url="https://inhomeka.online:8000/run_excel")]
    ])


def get_managers_list_kb(managers_list: list[dict]):
    keyboard_builder = InlineKeyboardBuilder()
    for manager in managers_list:
        keyboard_builder.button(text=f"{manager.get('manager_username')}", callback_data=f"manager:{manager.get('manager_id')}")
    keyboard_builder.adjust(1)
    
    return keyboard_builder.as_markup()