<?php
header('Content-Type: application/json');
include 'cors.php'; // Включение CORS, если необходимо
require_once 'db.php'; // Подключение к базе данных

function sendTelegramMessageWithComment($chatId, $comment) {
    $botToken = "7077985036:AAFHZ-JKekDokComqzFC6-f7-uijdDeKlTw";
    $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";

    $message = "Комментарий: $comment";

    $postFields = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];

    sendTelegramRequest($apiUrl, $postFields);
}

function sendTelegramRequest($url, $fields) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

try {
    // Получение соединения с базой данных
    $pdo = getDbConnection();

    // Получение данных из запроса
    $data = json_decode(file_get_contents('php://input'), true);

    // Проверка наличия необходимых данных
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    $id = $data['id'];
    $comment = isset($data['comment']) ? $data['comment'] : null;
    $modifiedPayment = isset($data['modified_payment']) && $data['modified_payment'] !== "" ? $data['modified_payment'] : null;
    $cardholder = isset($data['cardholder']) ? $data['cardholder'] : null;
    $bankname = isset($data['bankname']) ? $data['bankname'] : null;

    // Получение текущего значения verified и status из таблицы steps
    $stmt = $pdo->prepare('SELECT verified, status, id_usertg FROM steps WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $currentVerified = $row['verified'];
    $currentStatus = $row['status'];
    $chatId = $row['id_usertg'];

    // Инвертирование значения verified
    $newVerified = !$currentVerified;

    // Обновление значения verified, status, comment, modified_payment, cardholder и bankname в таблице steps
    $updateStmt = $pdo->prepare('UPDATE steps SET verified = :verified, status = :status, comment = :comment, modified_payment = :modified_payment, in_excel = 1, cardholder = :cardholder, bankname = :bankname WHERE id = :id');
    $updateStmt->bindParam(':verified', $newVerified, PDO::PARAM_BOOL);
    $newStatus = ($currentStatus == 0) ? 1 : $currentStatus;
    $updateStmt->bindParam(':status', $newStatus, PDO::PARAM_INT);
    $updateStmt->bindParam(':comment', $comment, PDO::PARAM_STR);
    $updateStmt->bindParam(':modified_payment', $modifiedPayment, PDO::PARAM_NULL | PDO::PARAM_STR);
    $updateStmt->bindParam(':cardholder', $cardholder, PDO::PARAM_STR);
    $updateStmt->bindParam(':bankname', $bankname, PDO::PARAM_STR);
    $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
    $updateStmt->execute();

    // Отправка комментария пользователю в бота
    if ($comment && $chatId) {
        sendTelegramMessageWithComment($chatId, $comment);
    }

    echo json_encode(['success' => true, 'verified' => $newVerified]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>