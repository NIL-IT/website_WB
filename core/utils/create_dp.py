from aiogram import Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from core import handlers

storage = MemoryStorage()
dp = Dispatcher(storage=storage)
dp.include_routers(handlers.user_private_router, handlers.admin_private_router)
