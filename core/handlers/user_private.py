import logging
import asyncio
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart, Command
from aiogram import Router, types, F, Bot
import requests
from requests.exceptions import HTTPError
from aiogram.types import BotCommandScopeDefault
import core.utils as utils
from core.settings import worksheet_user
from core import keyboards_bot
from core.keyboards_bot.keybord_user import get_subscribe_start, get_check_subscribe_kb, commands, get_subskr_btns
from core.keyboards_bot.keyboards_admin import get_start_btns_admin
from core.filters_bot import ChatTypeFilterMes, ChatTypeFilterCall
from core.logger_csm import CustomFormatter
from core.text_bot.message_text import start_message, notif_message, remind_message, referal_text
from core.filters_bot.isAdmin import admin_utils

import aiohttp
from core.settings import BACK_URL


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)

ch.setFormatter(CustomFormatter())

logger.addHandler(ch)

user_private_router = Router()
user_private_router.message.filter(ChatTypeFilterMes(['private']))
user_private_router.callback_query.filter(ChatTypeFilterCall(['private']))

CHANNEL_ID = "-1002218979236"  # Замените на ID вашего канала




## async def check_subscription(user_id: int) -> bool:
##     try:
##         member = await utils.bot.get_chat_member(CHANNEL_ID, user_id)
##         return member.status in ["member", "administrator", "creator"]
##     except Exception as e:
##         logger.error(f"Error checking subscription: {e}")
##         return False
#
## async def send_check_subscribe_message(user_id: int):
##     await asyncio.sleep(5) 
##     await utils.bot.send_message(
##         chat_id=user_id,
##         text="Нажмите кнопку после подписки на все каналы",
##         reply_markup=get_check_subscribe_kb(),
##         disable_web_page_preview=True
##     )
#
## async def send_delayed_notification(user_id: int):
##     await asyncio.sleep(5)  # Задержка перед первым сообщением
##     await utils.bot.send_message(
##         chat_id=user_id,
##         text=notif_message,
##         reply_markup=get_subscribe_start(),
##         disable_web_page_preview=True,
##         parse_mode=ParseMode.HTML
##     )
##     await send_check_subscribe_message(user_id)
 #   
##     # Запускаем задачу для отправки напоминания через 30 минут
##     asyncio.create_task(send_reminder(user_id))
#
## async def send_reminder(user_id: int):
##     await asyncio.sleep(3600)  # 60 минут
##     # Проверяем подписку перед отправкой напоминания
##     if not await check_subscription(user_id):
##         await utils.bot.send_message(
##             chat_id=user_id,
##             text=remind_message,
##             reply_markup=get_subscribe_start(),
##             disable_web_page_preview=True
##         )
##         await send_check_subscribe_message(user_id)

@user_private_router.message(CommandStart())
async def cmd_start(message: types.Message, bot:Bot):
    user_id = message.from_user.id
    
    ## # Проверяем, является ли пользователь новым
    ## if await utils.is_new_users(user_id=user_id):
    ##     worksheet_user.append_row([user_id, message.from_user.username, str(message.date)])
    ##     await utils.add_user_to_json(user_id=user_id)
    
    ## # Проверяем, подписан ли пользователь на канал
    ## print("fff")
    ## if await check_subscription(user_id):
    ## Если подписан, показываем меню с кнопками
    ## print(admin_utils(message.from_user.id))
    if admin_utils(message.from_user.id):
         await utils.bot.send_message(
        chat_id=user_id,
        # text="Напоминаем! Чтобы не потерять доступ к эксклюзивным акциям и товарам с кешбэком, рекомендуем подписаться на наши соцсети:",
        text="Добро пожаловать!\n\nНовые товары в каталоге появляются каждый день! Заходите утром, чтобы успеть выкупить понравившийся товар\n\nВот доступные опции:",
        reply_markup=keyboards_bot.get_start_btns_admin(),
        parse_mode=ParseMode.HTML,
        disable_web_page_preview=True)
    else:
        print("kkkk")
        await utils.bot.send_message(
        chat_id=user_id,
        text="Добро пожаловать!\n\nНовые товары в каталоге появляются каждый день! Заходите утром, чтобы успеть выкупить понравившийся товар\n\nВот доступные опции:",
        reply_markup=keyboards_bot.get_start_btns(),
        parse_mode=ParseMode.HTML,
        disable_web_page_preview=True)
            
    ## else:
    ##     # Если не подписан, отправляем сообщение с предложением подписаться
    ##     await utils.bot.send_message(
    ##         chat_id=user_id,
    ##         text=start_message,
    ##         parse_mode='MarkdownV2',
    ##         disable_web_page_preview=True,
    ##         reply_markup=types.ReplyKeyboardRemove()
    ##     )
    ##     asyncio.create_task(send_delayed_notification(user_id))
    ## await bot.set_my_commands(commands, BotCommandScopeDefault())

# @user_private_router.message(CommandStart())
# async def cmd_start(message: types.Message):
#     if await utils.is_new_users(user_id=message.from_user.id):
#         worksheet_user.append_row([message.from_user.id, message.from_user.username,str(message.date)])
#         await utils.add_user_to_json(user_id=message.from_user.id)
# #     link = utils.get_link.getHyperLink(url='https://t.me/cashback_market_1', title='Кэшбэк.Маркет') 
# #     link_web_app = 'https://testingnil.ru/catalog/'
# #     reply_markup = keyboards_bot.get_start_btns(link=link_web_app, sizes=(1,))
# #     await utils.bot.send_message(chat_id=message.from_user.id, text=start_message, reply_markup=reply_markup,
# #                                  parse_mode='MarkdownV2', disable_web_page_preview=True)
#     await utils.bot.send_message(chat_id=message.from_user.id, text=start_message, 
#                                  parse_mode='MarkdownV2', disable_web_page_preview=True)
#     asyncio.create_task(send_delayed_notification(message.from_user.id))

@user_private_router.callback_query(F.data == "check_subscribe")
async def check_subscribe_handler(callback: types.CallbackQuery):
    await callback.answer()
    is_subscribed = await check_subscription(callback.from_user.id)
    
    if is_subscribed:
        # link_web_app = 'https://testingnil.ru/catalog'
        # reply_markup = keyboards_bot.get_start_btns(link=link_web_app, sizes=(1,))
        if admin_utils(callback.from_user.id):
             await callback.message.edit_text(
            "Спасибо за подписку! Теперь у вас есть доступ к закрытому каталогу товаров.",
            reply_markup=get_start_btns_admin())
        else:
            await callback.message.edit_text(
                "Спасибо за подписку! Теперь у вас есть доступ к закрытому каталогу товаров.",
                reply_markup=keyboards_bot.get_start_btns())
    else:
        await callback.message.edit_text(
            "Вы не подписались на все каналы. Пожалуйста, подпишитесь и попробуйте снова.",
            reply_markup=get_subscribe_start()
        )
        await send_check_subscribe_message(callback.from_user.id)

@user_private_router.callback_query(F.data.startswith("about"))
async def about_info(callback: types.CallbackQuery):
    await callback.answer()
    text = (f'<b>Закрытый каталог товаров</b>')
    reply_markup = keyboards_bot.get_about_btns((1,), )
    await callback.message.edit_text(inline_message_id=callback.inline_message_id, text=text, reply_markup=reply_markup,
                                     parse_mode=ParseMode.HTML)

@user_private_router.callback_query(F.data.startswith("place_instruct"))
async def place_instruct_info(callback: types.CallbackQuery):
    await callback.answer()
    link = utils.get_link.getHyperLink(url='https://telegra.ph/Instrukciya-razmeshcheniya-06-21', title='Инструкция')

async def main_menu(callback: types.CallbackQuery):
    await callback.answer()
    # link = utils.get_link.getHyperLink(url='https://t.me/cashback_market_1', title='Кэшбэк.Маркет')
    text = (f'<b>Закрытый каталог товаров</b>')
    # link_web_app = 'https://testingnil.ru/catalog'
    # reply_markup = keyboards_bot.get_start_btns()
    await callback.message.edit_text(inline_message_id=callback.inline_message_id, text=text, reply_markup=keyboards_bot.get_start_btns(), parse_mode=ParseMode.HTML, disable_web_page_preview=True)
    
@user_private_router.message(Command(commands=['base']))
async def cmd_start(message: types.Message):
        await message.answer("Обновляю базу 🔄")
        try:
            response = requests.get('https://inhomeka.online:8000/run_report/') 
            response.raise_for_status()
        except HTTPError as http_err:
                await message.answer("Не удалось выполнить обновление :(")
                await message.answer(f'HTTP error occurred: {http_err}')
        except Exception as err:
                await message.answer("Не удалось выполнить обновление :(")
                await message.answer(f'Other error occurred: {err}')
        else:
                await message.answer("Обновление завершено ✅")

@user_private_router.message(Command(commands=['basePOST']))
async def cmd_start(message: types.Message):
        await message.answer("Обнавляю базу 🔄")
        try:
            requests.get('https://inhomeka.online:8000/run_report/')     
            # print(requests.get('https://testingnil.ru:8000/run_report/'))
            await message.answer("Обновление завершено ✅")
        except:
            await message.answer("Не удалось выполнить обновление :(")


@user_private_router.callback_query(F.data.startswith("referal"))
async def referal(callback: types.CallbackQuery):
    await callback.answer()
    await callback.message.answer(text=referal_text, parse_mode=ParseMode.HTML)
    await callback.message.answer(text='Просто перешли это сообщение другу, чтобы он тоже смог присоединиться к нашему закрытому клубу')

@user_private_router.callback_query(F.data.startswith("subskr"))
async def subskr(callback: types.CallbackQuery):
    await callback.answer()
    await callback.message.answer(text=f"Все официальные социальные сети бренда INHOMEKA⬇️\nПодписывайтесь, чтобы первыми узнавать о наших акциях, участвовать в конкурсах! А также мы регулярно публикуем полезный контент для порядка в доме🏠", reply_markup=get_subskr_btns())


# @user_private_router.message(Command(commands=['payments_dashboard']))
# async def cmd_start(message: types.Message):
#     await message.answer(text="Страница просмотра заявок на выплату", reply_markup=payments_btn())




# ===================================================================== #
                # ===  ДОРАБОТКИ от 11/06/2025 ===
# ===================================================================== #

# === РЕЙТИНГ ПОЛЬЗОВАТЕЛЕЙ === #
@user_private_router.message(Command("rating"))
async def get_raiting_table(message: types.Message):
    """ Получение гугл таблицы с рейтингом пользователей """
    
    await message.answer(
        text="Получаю информацию о вашем рейтинге..."
    )
    
    API_RAITING = BACK_URL + "/raiting"
    json = { "id_usertg": message.from_user.id }
    async with aiohttp.ClientSession() as session:
        async with session.post(url=API_RAITING, json=json) as response:
            data = await response.json()
            print(data)