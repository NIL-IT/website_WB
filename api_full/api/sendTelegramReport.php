<?php
require_once 'db.php'; // Подключение к базе данных

function sendTelegramMessage($chatId, $message) {
    $botToken = "7088761576:AAG2JhO4r1MTZ4aC5YpmRhzYs8OaGz1KV90";
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
    $stmt = $pdo->query("SELECT COUNT(*) AS review_count FROM steps WHERE step = 'Завершено'");
    $reviewCount = $stmt->fetch(PDO::FETCH_ASSOC)['review_count'];

    // Получение количества выплаченных строк
    $stmt = $pdo->query("SELECT COUNT(*) AS paid_count FROM steps WHERE paid = true");
    $paidCount = $stmt->fetch(PDO::FETCH_ASSOC)['paid_count'];

    // Получение количества невыплаченных строк
    $stmt = $pdo->query("SELECT COUNT(*) AS unpaid_count FROM steps WHERE verified = true");
    $unpaidCount = $stmt->fetch(PDO::FETCH_ASSOC)['unpaid_count'];

    // Формирование сообщения
    $message = "Пользователи: $userCount\n";
    $message .= "Отзывов: $reviewCount\n";
    $message .= "Выплаченные заказы: $paidCount\n";
    $message .= "Невыплаченные заказы: $unpaidCount\n";

    // Отправка сообщения в Telegram
    sendTelegramMessage($chatId, $message);

    echo json_encode(['success' => true, 'message' => 'Сообщение отправлено']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

?>
