<?php
require_once 'db.php'; // Подключение к базе данных

function sendTelegramMessage($chatId, $message) {
    $botToken = "7088761576:AAG2JhO4r1MTZ4A5YpmRhzYs8OaGz1KV90";
    $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";

    $postFields = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    return $response;
}

try {
    // Получение chat_id из переменных запроса
    if (!isset($_GET['chat_id'])) {
        throw new Exception('chat_id обязателен');
    }
    $chatId = $_GET['chat_id'];

    // Получение соединения с базой данных
    $pdo = getDbConnection();

    // Получение количества пользователей
    $stmt = $pdo->query('SELECT COUNT(*) AS user_count FROM users');
    $userCount = $stmt->fetch(PDO::FETCH_ASSOC)['user_count'];

    // Получение количества отзывов
    $stmt = $pdo->query('SELECT COUNT(*) AS review_count FROM steps WHERE step = "завершено"');
    $reviewCount = $stmt->fetch(PDO::FETCH_ASSOC)['review_count'];

    // Получение суммы выплаченных средств
    $stmt = $pdo->query('SELECT SUM(amount) AS paid_amount FROM steps WHERE paid = true');
    $paidAmount = $stmt->fetch(PDO::FETCH_ASSOC)['paid_amount'];

    // Получение суммы невыплаченных средств
    $stmt = $pdo->query('SELECT SUM(amount) AS unpaid_amount FROM steps WHERE verified = true');
    $unpaidAmount = $stmt->fetch(PDO::FETCH_ASSOC)['unpaid_amount'];

    // Формирование сообщения
    $message = "Пользователи: $userCount\n";
    $message .= "Отзывов: $reviewCount\n";
    $message .= "Выплачено: $paidAmount\n";
    $message .= "Не выплачено: $unpaidAmount\n";

    // Отправка сообщения в Telegram
    sendTelegramMessage($chatId, $message);

    echo json_encode(['success' => true, 'message' => 'Сообщение отправлено']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
