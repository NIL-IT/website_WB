import sqlite3
import logging


logging.basicConfig(level=logging.INFO)


def create_tables():
    query = """
        CREATE TABLE IF NOT EXISTS refs(
            tg_id INTEGER PRIMARY KEY,
            ref_id TEXT
        );
    """
    
    with sqlite3.connect("reff.db") as conn:
        cur = conn.cursor()
        try:
            cur.executescript(query)
            conn.commit()
            logging.info(f"База данных успешно создана")
        except Exception as e:
            logging.info(f"Не удалось создать базу данных: {e}")
                

def get_ref_id(user_id: int) -> str | None:
    """ Получение id реф. ссылки для указанного пользователя"""

    with sqlite3.connect("reff.db") as conn:
        cur = conn.cursor()
        
        try:
            cur.execute("SELECT ref_id FROM refs WHERE tg_id = ?", (user_id,))
            r = cur.fetchone()
            return r[0] if r else None
        except Exception as e:
            logging.info(f"Не удалось получить ref_id для пользователя {user_id}: {e}")
            return -1


def add_ref_id(user_id: int, ref_id: str):
    """ Закрепление реф. id за пользователем """
    
    with sqlite3.connect("reff.db") as conn:
        cur = conn.cursor()

        try:
            cur.execute("INSERT INTO refs VALUES (?, ?)", (user_id, ref_id))
            conn.commit()
        except Exception as e:
            logging.info(f"Не удалось закрепить ref_id для пользователя {user_id}: {e}")
            return -1
                
                
create_tables()