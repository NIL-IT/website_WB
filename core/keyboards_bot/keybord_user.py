from aiogram.types import WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton


# def get_start_btns(link: str, sizes: tuple[int, ...] = (2,)):
#     keyboard = InlineKeyboardBuilder()
#     keyboard.button(text='Перейти к покупкам', web_app=WebAppInfo(url=link))
#     keyboard.button(text='О сервисе', callback_data='about')
#     keyboard.button(text='Инструкция размещения', callback_data='place_instruct')
#     return keyboard.adjust(*sizes).as_markup()


def get_about_btns(sizes: tuple[int, ...] = (2,)):
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text='О сервисе', url='https://telegra.ph/O-servise-06-21')
    keyboard.button(text='Инструкция размещения', url='https://telegra.ph/Instrukciya-razmeshcheniya-06-21')
    keyboard.button(text="Назад", callback_data='menu')
    return keyboard.adjust(*sizes).as_markup()


def get_place_instruct_info_btns(link: str, sizes: tuple[int, ...] = (2,)):
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text='Разместить товар', web_app=WebAppInfo(url=link))
    keyboard.button(text="Назад", callback_data='menu')
    return keyboard.adjust(*sizes).as_markup()

def get_subscribe_start():
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text='Instagram ', url='https://inhomeka.mobz.link/startinhomekaru')
    keyboard.button(text='Telegram ', url='https://inhomeka.mobz.link/starttg')
    keyboard.button(text='ВКонтакте', url='https://inhomeka.mobz.link/startvk')
    return keyboard.adjust(3).as_markup()

def get_check_subscribe_kb():
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text='Подписался', callback_data='check_subscribe')
    return keyboard.adjust(1).as_markup()

def ref_btn():
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text='Вступить!', url='https://inhomeka.mobz.link/ourtg')
    return keyboard.adjust(1).as_markup()


def get_start_btns():
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text='🛁 Готовые комплекты бренда', url='https://inhomeka.ru/?utm_source=tg&utm_medium=club&utm_campaign=main')
    keyboard.button(text='📚 Каталог товаров с кэшбэком', web_app=WebAppInfo(url='https://inhomeka.online/catalog'))
    keyboard.button(text='🛒 Мои покупки', web_app=WebAppInfo(url='https://inhomeka.online/purchases'))
    keyboard.button(text='👭 Поделиться с другом', callback_data='referal')
    keyboard.button(text='❓Частые вопросы ', url='https://telegra.ph/Vopros-otvet-02-04-2')
    keyboard.button(text='📩Обратная связь и поддержка', url='https://t.me/razdadim5')
    keyboard.button(text='🏆 Мой статус', web_app=WebAppInfo(url='https://inhomeka.online/profile'))
    keyboard.button(text='📱Наши социальные сети', callback_data='subskr')

    return keyboard.adjust(1).as_markup()


from aiogram.types import BotCommand
commands = [
        BotCommand(command='start', description='Главное меню')
    ]

def get_subskr_btns():
    keyboard = InlineKeyboardBuilder()
    keyboard.button(text='Instagram', url='https://inhomeka.mobz.link/ourinst')
    keyboard.button(text='Telegram канал', url='https://inhomeka.mobz.link/ourtg')
    keyboard.button(text='ВКонтакте', url='https://inhomeka.mobz.link/ourvk')
    keyboard.button(text='Одноклассники', url='https://inhomeka.mobz.link/ourok')
    keyboard.button(text='YouTube', url='https://inhomeka.mobz.link/ouryoutube')
    keyboard.button(text='TikTok', url='https://inhomeka.mobz.link/ourtiktok')
    keyboard.button(text='Pinterest', url='https://inhomeka.mobz.link/ourpinterest')
    keyboard.button(text='Яндекс Дзен', url='https://inhomeka.mobz.link/ourdzen')
    keyboard.button(text='Likee', url='https://l.likee.video/p/aYwxkW')
    keyboard.button(text='Snapchat', url='https://inhomeka.mobz.link/oursnapchat')
    keyboard.button(text='Wibes', url='https://inhomeka.mobz.link/ourwibes')
    return keyboard.adjust(1).as_markup()
