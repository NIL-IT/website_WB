<?php
header('Content-Type: application/json');
include 'cors.php';
require_once 'db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['user_id'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    $user_id = (int)$data['user_id'];
    $pdo = getDbConnection();

    // Получим текущую запись пользователя, чтобы узнать путь до изображения
    $stmt = $pdo->prepare('SELECT confirmation_image FROM users WHERE id = :id LIMIT 1');
    $stmt->bindParam(':id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'User not found']);
        exit;
    }

    $imagePath = $user['confirmation_image'];

    // Попытаемся удалить файл с диска, если он есть и путь не пуст
    if (!empty($imagePath)) {
        // Если в БД хранится полный URL, попробуем извлечь относительную часть
        $parsed = $imagePath;
        // убираем возможный префикс https://inhomeka.online:8000/
        $parsed = preg_replace('#^https?://[^/]+/#i', '', $parsed);
        $localPath = __DIR__ . '/../../' . ltrim($parsed, '/'); // поднимаемся к корню сайта и формируем путь
        if (file_exists($localPath) && is_file($localPath)) {
            @unlink($localPath);
        }
    }

    // Обновляем запись пользователя: убираем confirmation_image и ставим confirmation = 0
    $stmt = $pdo->prepare('UPDATE users SET confirmation_image = NULL, confirmation = 0 WHERE id = :id');
    $stmt->bindParam(':id', $user_id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
