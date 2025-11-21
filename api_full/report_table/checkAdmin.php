<?php
header('Content-Type: application/json');
require_once 'db.php';

// Получение id пользователя из запроса (или из GET для браузера)
$data = json_decode(file_get_contents('php://input'), true);
$id_usertg = isset($data['id_usertg']) ? $data['id_usertg'] : (isset($_GET['id_usertg']) ? $_GET['id_usertg'] : null);

// Если нет id, то ставим "unknown"
if (!$id_usertg) {
    $id_usertg = 'unknown';
}

// Проверка статуса пользователя
$access = false;
$status_text = '';
try {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare('SELECT status FROM users WHERE id_usertg = :id_usertg');
    $stmt->bindParam(':id_usertg', $id_usertg, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && $user['status'] === 'admin') {
        $access = true;
        $status_text = 'доступ разрешён';
        echo json_encode(['success' => true]);
    } else {
        $access = false;
        $status_text = 'доступ запрещён';
        echo json_encode(['success' => false, 'error' => 'Нет прав администратора']);
    }
} catch (PDOException $e) {
    $access = false;
    $status_text = 'ошибка БД';
    echo json_encode(['success' => false, 'error' => 'Ошибка БД: ' . $e->getMessage()]);
}

// Логирование попытки доступа
$log_dir = __DIR__ . '/logs';
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0777, true);
}
$log_file = $log_dir . '/' . date('Y-m-d') . '.txt';
$log_line = date('Y-m-d H:i:s') . " | id: $id_usertg | $status_text" . PHP_EOL;
file_put_contents($log_file, $log_line, FILE_APPEND);
?>
