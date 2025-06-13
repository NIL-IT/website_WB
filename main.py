import asyncio
import logging
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command

import core.utils as utils
from core.handlers.admin import *
from core.handlers.admin_private import *
from core.handlers.user_private import *


async def main(dp: utils.create_dp.Dispatcher):
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s")
    # logging.basicConfig(level=logging.INFO, format='%(asctime)s - [%(levelname)s] - %(name)s'
    #                                                '(%(filename)s).%(funcName)s(%(lineno)d) - %(message)s')
    await utils.bot.delete_webhook(drop_pending_updates=True)

    dp.message.register(quith, Command(commands=['opros'])) #
    dp.callback_query.register(quith_user, Quiz.Q)
    dp.callback_query.register(quith_user, F.data.startswith("quith_"))
    dp.callback_query.register(done_quiz, Command(commands=['start_opros']))
    dp.message.register(update_opros, Command(commands=['res_opros']))
    dp.message.register(get_managers_list, Command(commands=['payout_balances']))
    dp.message.register(get_raiting_table, Command(commands=['raiting']))
    
    try:
        await dp.start_polling(utils.bot)
    finally:
        await utils.bot.session.close()


if __name__ == "__main__":
    asyncio.run(main(utils.dp))
