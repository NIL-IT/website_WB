from aiogram.filters import Filter
from aiogram.types import Message
from config import ADMINS
from config import SUPER_ADMIN



class is_admin(Filter):
    async def __call__(self, message: Message) -> bool:
        for i in ADMINS:
            if str(message.from_user.id) == str(i):
                return True
        else:
            return False

class super_admin(Filter):
    async def __call__(self, message: Message) -> bool:
        # for i in SUPER_ADMIN:
        if str(message.from_user.id) == SUPER_ADMIN:
            return True
        else:
            return False

def admin_utils(id):
     for i in ADMINS:
        if str(id) == str(i):
                return True
        else:
            return False