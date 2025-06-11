from aiogram import Bot,types
from aiogram.types.input_file import FSInputFile
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.types import Message,CallbackQuery
import core.utils as utils

import sqlite3
from core.settings import worksheet
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder



class Quiz(StatesGroup):
    Q = State()



# data = [
#     ["photo","4Вопрос",["1","2","3","4","5"]],
#     ["photo","Вопрос1",["1","2","3","4","5"]],       
#     ["photo","Вопрос8",["1","3","4","5"]]
# ]
qiuth_btn_finish = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="❤️", callback_data="adest")]
]) 
# done_quiz = InlineKeyboardMarkup(inline_keyboard=[
#     [InlineKeyboardButton(text="Отправить", callback_data="done_quiz")]
# ]) 

data_user = []

def quith_btn_user(answer,nam): 
    but = InlineKeyboardBuilder()
    data = fetch_data_from_db()
    ss = len(data)
    for i in range(len(answer)):
        but.button(text=str(answer[i]),callback_data=f"quith_{nam}_{i+1}")
    if nam == ss-1:
        but.button(text=str("Завершить"),callback_data=f"quithfinish") 
    else:
        but.button(text=str("Отправить"),callback_data=f"quithnext") 
     
    but.adjust(1)
    return but.as_markup()

def quith_sheet_db():
    return True


def fetch_data_from_db():
    conn = sqlite3.connect('opros.db')
    cursor = conn.cursor()
    cursor.execute('SELECT photo, vopros FROM opros')
    data = cursor.fetchall() 
    res = []
    for i in data:
        res.append(list(i))
    cursor.execute('SELECT otvet1, otvet2, otvet3, otvet4, otvet5 FROM opros')
    data2 = cursor.fetchall()# Получаем данные в виде списка кортежей
    res2 = []
    for i in data2:
        res2.append(list(i))
    conn.close()
    for i in range(len(res)):
        res[i].append(res2[i])
    # print(res)
    return res


async def quith(message:Message, state:FSMContext):
    get_google_sheet_data()
    data = fetch_data_from_db()
    await message.answer("После проверки опроса нажмите /start_opros, чтобы отправить опрос всем пользователям")
    await message.answer(data[0][1], reply_markup=quith_btn_user(data[0][2],0))





async def quith_user(call:CallbackQuery,state:FSMContext):
    info = await state.get_data()
    s_q = info.get('s')
    if s_q == None:
        await state.update_data(s = [])

        await state.update_data(nam_quith = ((call.data).split('_'))[1])
    await state.set_state(Quiz.Q)
    if ((call.data).split('_'))[0] == "quith":
        s = ((call.data).split('_'))[2]
        info = await state.get_data()
        s_q = info.get('s')
        s_q.append(s)
        await state.update_data(s = s_q)
        await state.update_data(nam_quith = ((call.data).split('_'))[1])
    elif call.data =="quithfinish":
        data_user.append(s_q)
        info = await state.get_data()
        nam = int(info.get('nam_quith'))
        await state.clear()
        res = []
        for i in range(len(data_user)):
            res.append(",".join(data_user[i]))
        r = "_".join(res)
        # print([int(call.from_user.id), str(call.from_user.username),str(r)])
        insert_user_data_db(int(call.from_user.id), str(call.from_user.username),str(r))
        await call.message.edit_text("Спасибо за участие", reply_markup=qiuth_btn_finish)
    else:
        data = fetch_data_from_db()
        data_user.append(s_q)
        # print(data,"\n",data_user)
        info = await state.get_data()
        nam = int(info.get('nam_quith'))
        # print(data[nam+1][1])
        # data = info.get('data')
        await state.clear()
        await call.message.edit_text(f"{data[nam+1][1]}", reply_markup=quith_btn_user(data[nam+1][2],nam+1))






def get_google_sheet_data():
    data = worksheet.get_all_values()[1:11] # Получаем строки 2-11 (индексация с 0)
    # data2 = worksheet.get('C2:G11')
    # for i in range(len(data)):
        # data[i].append(data2[i])
    insert_data_into_db(data)
    return True

# Функция для загрузки данных в SQLite базу данных
def insert_data_into_db(data):
    conn = sqlite3.connect('opros.db')
    cur = conn.cursor()
    try:
        cur.execute('DELETE FROM opros')
    except:
        pass
    
    cur.execute('''CREATE TABLE IF NOT EXISTS user 
                      (user_id TEXT, user_name TEXT, otvet)''')
    cur.execute('''CREATE TABLE IF NOT EXISTS opros 
                      (photo TEXT, vopros TEXT, otvet1 TEXT, otvet2 TEXT, otvet3 TEXT, otvet4 TEXT, otvet5 TEXT)''')
    cur.executemany('INSERT INTO opros (photo, vopros, otvet1, otvet2, otvet3, otvet4, otvet5) VALUES (?, ?, ?, ?, ?, ?, ?)', data)
    conn.commit()
    conn.close()

def insert_user_data_db(idn:int, name:str, data:str):
    conn = sqlite3.connect('opros.db')
    cur = conn.cursor()
    insert_start_message = (f"INSERT INTO user (user_id, user_name, otvet) VALUES ('{idn}','{name}','{data}')")
    cur.execute(insert_start_message)
    cur.connection.commit()

    conn.close()






















async def done_quiz(message:Message, bot:Bot):
    data = fetch_data_from_db()
    
    # print(data)
    # await state.update_data(data = data)
    users_json = await utils.get_data_json(path='core/data/users.json')  

    # await message.answer(data[0][1], reply_markup=quith_btn_user(data[0][2],0))
    try:
        # users = get_user_id() #все пользователи
            # if photo == None:
        for user in user in users_json['users']: 
            await bot.send_message(user, data[0][1], reply_markup=quith_btn_user(data[0][2],0)) 
            # else:
        # for user in users: 
            # await bot.send_photo(chat_id=user, photo=photo, caption=str(text)) 
    except:
        pass
    
    # await bot.send_message(chat_id="-4202728684", text=f"Рассылка по всем пользователям\n\nне отправленных сообщений: {log}") 
    await message.answer("Сообщение успешно отправлено всем пользователям.")  #Рассылка по пользователям



async def update_opros(message:Message):
    upload_data_to_google_sheets()
    await message.answer("Данные успешно обновлены в таблице Google Sheets.")

from core.settings import sheet
def upload_data_to_google_sheets():  
    conn = sqlite3.connect('opros.db')
    cur = conn.cursor()

    # Извлечение всех данных
    cur.execute("SELECT * FROM user")
    data = cur.fetchall()
    print(data)

    # Закрытие соединения с базой данных
    conn.close()  
    try:
        
        worksheets = sheet.worksheets()
        if len(worksheets) > 1:
            for worksheet in worksheets[1:]:  
                sheet.del_worksheet(worksheet)
        
        worksheet = sheet.add_worksheet(title="Результаты опроса", rows="100", cols="20")
        for row in data:
            worksheet.append_row(row)
        
        # print("Данные успешно загружены в Google Sheets.")
    except Exception as e:
        print(f"Ошибка загрузки данных в Google Sheets: {e}")

    return True



















