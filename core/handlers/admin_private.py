from aiogram import Bot
import aiohttp
from aiogram.enums import ParseMode
from aiogram.filters import Command
from aiogram import Router, types, F, filters
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from core.keyboards_bot.keyboards_admin import admin_corect_all, mailing_button, get_btn_mailing, mailing_castom_button, payments_btn, keyboard_otchet
from aiogram.types import Message,CallbackQuery
import aiohttp
from aiogram.types import InputFile
import sqlite3
from core.text_bot.message_text import welcome_text_admin
import io



import core.utils as utils

from core import keyboards_bot
from core.filters_bot import ChatTypeFilterMes, ChatTypeFilterCall, is_admin
from core.states import Admin

admin_private_router = Router()
admin_private_router.message.filter(ChatTypeFilterMes(['private']))
admin_private_router.callback_query.filter(ChatTypeFilterCall(['private']))




class AdminPanel(StatesGroup):
    button = State()
    button_name = State()
    photo = State()
    mess_all = State()

class SUPERADMIN(StatesGroup):
    GET_ID = State()

@admin_private_router.message(Command('stat_managers'))
async def send_report(message: types.Message):
    await message.answer("Нажмите на кнопку ниже, чтобы открыть отчет:", reply_markup=keyboard_otchet)

# async def fetch_report(url):
#     async with aiohttp.ClientSession() as session:
#         async with session.get(url) as response:
#             if response.status == 200:
#                 return await response.read()
#             else:
#                 raise Exception(f"Failed to fetch report: {response.status}")

@admin_private_router.message(is_admin(), Command('mailing'))
async def cmd_admin(message: types.Message, state: FSMContext):
    await state.clear()
    await state.set_state(AdminPanel.mess_all)  
    await message.answer(f"_Рассылка по пользователям_\n\nВведите текст и фото в одном сообщении, либо текст без фотографии",parse_mode="markdown")

@admin_private_router.callback_query(F.data.startswith("admin"))
async def cmd_admin(call: CallbackQuery, state: FSMContext):
    await call.answer()
    await state.clear()
    await state.set_state(AdminPanel.mess_all)  
    await call.message.answer(f"_Рассылка по пользователям_\n\nВведите текст и фото в одном сообщении, либо текст без фотографии",parse_mode="markdown")

@admin_private_router.message(filters.StateFilter(AdminPanel.mess_all))
async def write_but(message: types.Message, state: FSMContext):
    if message.photo:
        await state.update_data(mess = message.caption)
        await state.update_data(photo = message.photo[-1].file_id)
    else:
        await state.update_data(mess = message.text)

    await message.answer(f"_Рассылка по пользователям_\n\nВыберите функционал кнопки",reply_markup=get_btn_mailing,parse_mode="markdown")


@admin_private_router.callback_query( F.data.startswith("btn_mailing"))
async def mailimg_done(call:CallbackQuery, state:FSMContext, bot:Bot):
    data = ((call.data).split('_'))[2]
    # print(data)
    if  data == "castom":
        await state.set_state(AdminPanel.button) 
        await state.update_data(castom_btn = True)
        await call.message.edit_text(f"_Рассылка по пользователям_\n\nОтправле ссылку которую добавим в кнопку",parse_mode="markdown")
    else:
        await state.set_state(AdminPanel.button_name)
        await state.update_data(castom_btn = False)
        await call.message.edit_text(f"_Рассылка по пользователям_\n\nНапишите название кнопки",parse_mode="markdown")

@admin_private_router.message(filters.StateFilter(AdminPanel.button))
async def get_chek_message(message: types.Message, bot:Bot, state: FSMContext):
    await state.set_state(AdminPanel.button_name)
    await state.update_data(castom_link = message.text)
    await message.answer(f"_Рассылка по пользователям_\n\nНапишите название кнопки",parse_mode="markdown")
    


@admin_private_router.message(filters.StateFilter(AdminPanel.button_name))##############
async def get_chek_message(message: types.Message, bot:Bot, state: FSMContext):
    await state.set_state(AdminPanel.photo)
    await state.update_data(btn = message.text)
    info = await state.get_data()
    photo = info.get('photo')
    castom_btn = info.get('castom_btn')
    castom_link = info.get('castom_link')
    # print(photo)
    text = info.get('mess')
    if castom_btn:
        # тут кастомная кнопка
        if photo:
            await bot.send_photo(message.from_user.id, photo, caption=text,reply_markup=mailing_castom_button(message.text,castom_link))  
            await message.answer(text="*Проверьте пост с кастомной кнопкой.* Если допустили ошибку - нажмите отмена и заполните поля еще раз", reply_markup=admin_corect_all,parse_mode="markdown")
        else:
            await message.answer(text,reply_markup=mailing_castom_button(message.text,castom_link))
            await message.answer(text="*Проверьте пост с кастомной кнопкой.* Если допустили ошибку - нажмите отмена и заполните поля еще раз", reply_markup=admin_corect_all,parse_mode="markdown")
    else:
        if photo:
            await bot.send_photo(message.from_user.id, photo, caption=text,reply_markup=mailing_button(message.text))  
            await message.answer(text="*Проверьте пост с обычной кнопкой.* Если допустили ошибку - нажмите отмена и заполните поля еще раз", reply_markup=admin_corect_all,parse_mode="markdown")
        else:
            await message.answer(text,reply_markup=mailing_button(message.text))
            await message.answer(text="*Проверьте пост с обычной кнопкой.* Если допустили ошибку - нажмите отмена и заполните поля еще раз", reply_markup=admin_corect_all,parse_mode="markdown")


# @admin_private_router.callback_query( F.data.startswith("mailing_btn"))
# async def mailimg_done(call:CallbackQuery, state:FSMContext, bot:Bot):
#     await state.set_state(AdminPanel.button)  
#     await call.answer()
#     await call.message.answer("Напишите название кнопки")

@admin_private_router.callback_query( F.data.startswith("mailing_done_all"))
async def mailimg_done(call:CallbackQuery, state:FSMContext, bot:Bot):
    await call.answer()
    info = await state.get_data()
    text = info.get('mess')
    photo = info.get('photo')
    btn = info.get('btn')
    castom_btn = info.get('castom_btn')
    castom_link = info.get('castom_link')
    # print(text,"text")
    # print(photo,"photo")
    await state.clear()
    log = 0
    users_json = await utils.get_data_json(path='core/data/users.json')  
    # print(users_json)
    if castom_btn:
        for user in users_json['users']:
        # print(user)
            try:
                if photo == None:
                    await bot.send_message(user['id'], text,reply_markup=mailing_castom_button(btn,castom_link)) 
                    # print(f"Отправленно сообщение фото {user['id']}")
                else:
                    await bot.send_photo(chat_id=user['id'], photo=photo, caption=str(text),reply_markup=mailing_castom_button(btn,castom_link)) 
                    # print(f"Отправленно сообщение текст {user['id']}")
            except:
                log+=1
                # print("Пропущенно")
                pass
    else:
        for user in users_json['users']:
            # print(user)
            try:
                if photo == None:
                    await bot.send_message(user['id'], text,reply_markup=mailing_button(btn)) 
                    # print(f"Отправленно сообщение фото {user['id']}")
                else:
                    await bot.send_photo(chat_id=user['id'], photo=photo, caption=str(text),reply_markup=mailing_button(btn)) 
                    # print(f"Отправленно сообщение текст {user['id']}")
            except:
                log+=1
                # print("Пропущенно")
                pass
    
    ##### изменения от 04/04/2025
    try:
        conn = sqlite3.connect('opros.db')
        cursor = conn.cursor()

        cursor.execute("UPDATE stat SET not_activ_user = ?", (log,))
        conn.commit()

        if cursor.rowcount > 0:
            try:
                await bot.send_message(
                    chat_id=665111465,
                    text="✅ Данные успешно внесены в базу!\n"
                         f"Неактивных пользователей (вносимое): {log}"
                )
            except Exception as notify_error:
                print(f"Ошибка отправки уведомления: {notify_error}")
        else:
            try:
                await bot.send_message(
                    chat_id=665111465,
                    text="⚠️ Данные не обновлены!\n"
                         "Не найдено записей для обновления в таблице stat"
                )
            except Exception as notify_error:
                print(f"Ошибка отправки уведомления: {notify_error}")

        conn.close()

    except Exception as e:
        print(f"Ошибка при работе с базой данных: {e}")
        try:
            await bot.send_message(
                chat_id=665111465,
                text="❌ Ошибка при внесении данных!\n"
                     f"Ошибка: {str(e)}"
            )
        except Exception as notify_error:
            print(f"Ошибка отправки уведомления об ошибке: {notify_error}")
    ##### 04/04

    # await bot.send_message(chat_id="-4202728684", text=f"Рассылка по всем пользователям\n\nне отправленных сообщений: {log}") 
    await call.message.reply("Сообщение успешно отправлено всем пользователям.")  #Рассылка по пользователям






@admin_private_router.message(is_admin(), Command('stat_user'))
async def cmd_admin(message: types.Message, state: FSMContext):
    chat_id = message.chat.id
    url = f"https://inhomeka.online:8000/sendTelegramReport?chat_id={chat_id}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                response.raise_for_status()  # Проверяем на ошибки HTTP
    except aiohttp.ClientError as e:
        await message.answer(f"Произошла ошибка при запросе: {e}")
    
##### изменения от 04/04/2025
    try:
        conn = sqlite3.connect('opros.db')
        cursor = conn.cursor()
        
        # Получаем количество неактивных пользователей
        cursor.execute("SELECT not_activ_user FROM stat WHERE id = 1")
        result = cursor.fetchone()
        
        if result:
            count = result[0]
            await message.answer(f"🛑 Количество пользователей, заблокировавших бота: {count}")
        else:
            await message.answer("❌ Данные о неактивных пользователях не найдены в базе")
        
        conn.close()
        
    except sqlite3.Error as e:
        await message.answer(f"⚠️ Ошибка при работе с базой данных: {str(e)}")
    except Exception as e:
        await message.answer(f"⚠️ Неожиданная ошибка: {str(e)}")
   

@admin_private_router.message(is_admin(), Command('super_admin'))
async def admin_panel(message: Message):
    await message.answer(welcome_text_admin, parse_mode=ParseMode.HTML)


 ##### 04/04

@admin_private_router.message(is_admin(), Command('payments_dashboard'))
async def cmd_paymant(message: types.Message):
    await message.answer(text="Страница просмотра заявок на выплату", reply_markup=payments_btn())

###################################################################



#### 28.04
from aiogram.types import BufferedInputFile
@admin_private_router.message(is_admin(), Command('all_payments'))
async def send_excel_file(message: types.Message):
    # Отправляем сообщение о подготовке файла
    preparing_msg = await message.answer("⏳ Подготавливаю базу платежей...")
    
    url = "https://inhomeka.online:8000/run_excel_user/"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    file_data = await response.read()
                    
                    # Создаем InputFile
                    input_file = BufferedInputFile(
                        file=file_data,
                        filename="payments.xlsx"
                    )
                    
                    # Отправляем файл и удаляем сообщение о подготовке
                    await message.answer_document(document=input_file)
                    await preparing_msg.delete()
                    
                else:
                    await message.answer(f"❌ Ошибка: сервер вернул статус {response.status}")
                    await preparing_msg.delete()
                    
    except aiohttp.ClientError as e:
        await message.answer(f"❌ Ошибка соединения: {str(e)}")
        await preparing_msg.delete()
    except Exception as e:
        await message.answer(f"❌ Неизвестная ошибка: {str(e)}")
        await preparing_msg.delete()



##################################################################

@admin_private_router.message(is_admin(), Command('get_new_admin'))
async def cmd_admin(message: types.Message, state: FSMContext):
    print("словил")
    await state.set_state(SUPERADMIN.GET_ID)
    await message.answer("оправте id пользователя которого нужно назначить модератором/админом на сайте или на оборот обычным пользователем")

@admin_private_router.message(is_admin(),filters.StateFilter(SUPERADMIN.GET_ID))##############
async def cmd_admin(message: types.Message, state: FSMContext):
    user_id = int(message.text)
    url = f"https://inhomeka.online:8000/update_status?id_usertg={user_id}"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                response.raise_for_status()  # Проверяем на ошибки HTTP
                
                # Читаем текст ответа
                response_text = await response.text()
                words = response_text.split()
                last_word = words[-1] if words else "Ошибка"
                
                # Отправляем текст ответа в чат
                await message.answer(f"Пользователь переведен в статус: {last_word}")

                
    except aiohttp.ClientError as e:
        await message.answer(f"Произошла ошибка при запросе: {e}")
    await state.clear()

    #     # https://testingnil6.ru:8000/update_status?id_usertg=
