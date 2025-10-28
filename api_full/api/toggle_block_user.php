<?php
require 'cors.php';
require 'db.php';

// Обработка AJAX-запросов
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json; charset=utf-8');

    $action = $_POST['action'];
    $conn = getDbConnection();

    if ($action === 'find') {
        $username = trim((string)($_POST['username'] ?? ''));
        $username = ltrim($username, '@');
        if ($username === '') {
            echo json_encode(['success' => false, 'message' => 'Empty username']);
            exit;
        }
        $stmt = $conn->prepare('SELECT id, id_usertg, username, blocked FROM users WHERE username = :username LIMIT 1');
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            $blocked = !empty($user['blocked']) ? true : false;
            echo json_encode(['success' => true, 'data' => ['id' => $user['id'], 'id_usertg' => $user['id_usertg'], 'username' => $user['username'], 'blocked' => $blocked]]);
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
        exit;
    }

    if ($action === 'toggle') {
        $id = $_POST['id'] ?? null; // ожидаем внутренний id из таблицы users
        $username = isset($_POST['username']) ? ltrim(trim((string)$_POST['username']), '@') : null;

        // Найдём пользователя по id или username
        if ($id) {
            $stmt = $conn->prepare('SELECT id, blocked FROM users WHERE id = :id LIMIT 1');
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
        } elseif ($username) {
            $stmt = $conn->prepare('SELECT id, blocked FROM users WHERE username = :username LIMIT 1');
            $stmt->bindParam(':username', $username, PDO::PARAM_STR);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            echo json_encode(['success' => false, 'message' => 'No identifier provided']);
            exit;
        }

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit;
        }

        $newBlocked = empty($user['blocked']) ? 1 : 0;
        $update = $conn->prepare('UPDATE users SET blocked = :blocked WHERE id = :id');
        $update->bindParam(':blocked', $newBlocked, PDO::PARAM_INT);
        $update->bindParam(':id', $user['id'], PDO::PARAM_INT);
        $ok = $update->execute();

        if ($ok) {
            echo json_encode(['success' => true, 'blocked' => (bool)$newBlocked]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update']);
        }
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Unknown action']);
    exit;
}

// Рендер HTML страницы
?>
<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Toggle Block User</title>
<style>
    body{font-family:Arial,Helvetica,sans-serif;padding:20px}
    .row{margin-bottom:10px}
    input[type="text"]{padding:6px;width:250px}
    button{padding:6px 10px}
    .info{margin-top:12px}
    .status{font-weight:700;margin-right:8px}
</style>
</head>
<body>
    <h2>Поиск пользователя и переключение блокировки</h2>
    <div class="row">
        <label>Username: <input type="text" id="username" placeholder="Введите username (с @ или без)"></label>
        <button id="findBtn">Найти</button>
    </div>
    <div id="result" class="info"></div>

<script>
document.getElementById('findBtn').addEventListener('click', function () {
    const inp = document.getElementById('username');
    let username = inp.value.trim();
    if (!username) {
        alert('Введите username');
        return;
    }
    username = username.replace(/^@+/, '');
    const form = new FormData();
    form.append('action', 'find');
    form.append('username', username);

    fetch(location.pathname, { method: 'POST', body: form })
        .then(r => r.json())
        .then(resp => {
            const resDiv = document.getElementById('result');
            resDiv.innerHTML = '';
            if (!resp.success) {
                resDiv.textContent = resp.message || 'Не найдено';
                return;
            }
            const u = resp.data;
            const statusText = u.blocked ? 'Заблокирован' : 'Не заблокирован';
            const btn = document.createElement('button');
            btn.textContent = u.blocked ? 'Разблокировать' : 'Заблокировать';
            btn.addEventListener('click', function () {
                toggleBlock(u.id);
            });

            resDiv.innerHTML = `<div><span class="status">User:</span> ${u.username} (id: ${u.id_usertg})</div>
                                <div><span class="status">Статус:</span> <span id="blockStatus">${statusText}</span></div>`;
            resDiv.appendChild(btn);
        })
        .catch(err => {
            alert('Ошибка запроса');
            console.error(err);
        });
});

function toggleBlock(userId) {
    const form = new FormData();
    form.append('action', 'toggle');
    form.append('id', userId);

    fetch(location.pathname, { method: 'POST', body: form })
        .then(r => r.json())
        .then(resp => {
            if (!resp.success) {
                alert(resp.message || 'Ошибка при переключении');
                return;
            }
            const statusElem = document.getElementById('blockStatus');
            const newBlocked = resp.blocked;
            statusElem.textContent = newBlocked ? 'Заблокирован' : 'Не заблокирован';
            // Обновим текст кнопки
            const btn = document.querySelector('#result button');
            if (btn) btn.textContent = newBlocked ? 'Разблокировать' : 'Заблокировать';
        })
        .catch(err => {
            alert('Ошибка запроса');
            console.error(err);
        });
}
</script>
</body>
</html>
