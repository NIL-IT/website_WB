<?php
header('Content-Type: application/json');
include 'cors.php'; // Включение CORS, если необходимо
require_once 'db.php'; // Подключение к базе данных

function sendTelegramMessageWithReceipt($chatId, $imagePath) {
    $botToken = "7088761576:AAG2JhO4r1MTZ4A5YpmRhzYs8OaGz1KV90";
    $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";

    $reportUrl = "https://testingnil6.ru:8000/$imagePath";
    $message = "❤️ Спасибо за участие! Ваш чек по кнопке ниже";

    $replyMarkup = json_encode([
        'inline_keyboard' => [
            [
                ['text' => 'Посмотреть чек', 'web_app' => ['url' => $reportUrl]]
            ]
        ]
    ]);

    $postFields = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML',
        'reply_markup' => $replyMarkup
    ];

    sendTelegramRequest($apiUrl, $postFields);
}

function sendTelegramInvitationMessage($chatId) {
    $botToken = "7088761576:AAG2JhO4r1MTZ4A5YpmRhzYs8OaGz1KV90";
    $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";

    // Второе сообщение
    $message1 = "🎉 Приглашайте в закрытый клуб своих друзей, чтобы они тоже могли покупать с выгодой и участвовать в развитии бренда. Чтобы пригласить друга - просто перешлите ему сообщение ниже:";
    
    $postFields1 = [
        'chat_id' => $chatId,
        'text' => $message1,
        'parse_mode' => 'HTML'
    ];
    sendTelegramRequest($apiUrl, $postFields1);

    // Третье сообщение
    $message2 = "Привет! Я нашел закрытый клуб бренда товаров для дома INHOMEKA, там раздают товары бренда с кэшбеком 80-100%, а еще можно поучаствовать в развитии бренда и получить за это бонусы! 🎁\n\n"
        . "🔵 Это моя персональная пригласительная ссылка для тебя.\n"
        . "Вступай в клуб и становись частью закрытого сообщества бренда INHOMEKA.";

    $postFields2 = [
        'chat_id' => $chatId,
        'text' => $message2,
        'parse_mode' => 'HTML'
    ];
    sendTelegramRequest($apiUrl, $postFields2);
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

    // Проверка наличия ID
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    $id = $data['id'];

    // Обработка изображения
    $imagePath = null;
    if (isset($data['receipt'])) {
        $imageDirectory = '../api/uploads/';
        if (!is_dir($imageDirectory)) {
            mkdir($imageDirectory, 0755, true);
        }

        $imageData = $data['receipt'];
        $imageName = uniqid() . '.png';
        $imagePath = $imageDirectory . $imageName;

        $imageData = str_replace('data:image/png;base64,', '', $imageData);
        $imageData = base64_decode($imageData);

        if (!file_put_contents($imagePath, $imageData)) {
            echo json_encode(['success' => false, 'error' => 'Failed to save image']);
            exit;
        }

        // Сохранение относительного пути в базу данных
        $imagePath = 'uploads/' . $imageName;
    }

    // Получение текущего значения paid и status из таблицы steps
    $stmt = $pdo->prepare('SELECT paid, status, receipt_image FROM steps WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $currentPaid = $row['paid'];
    $currentStatus = $row['status'];
    $currentReceiptImage = $row['receipt_image'];

    // Проверка значения status
    if ($currentStatus != 1 && $currentStatus != 2 && $currentStatus != 3) {
        echo json_encode(['success' => false, 'error' => 'Invalid status']);
        exit;
    }

    // Инвертирование значения paid
    $newPaid = !$currentPaid;

    // Обновление значения paid и пути к изображению в таблице steps
    $newStatus = $newPaid ? 3 : 2;
    if ($newPaid) {
        $updateStmt = $pdo->prepare('UPDATE steps SET paid = :paid, receipt_image = :receipt_image, status = :status WHERE id = :id');
        $updateStmt->bindParam(':receipt_image', $imagePath, PDO::PARAM_STR);
    } else {
        $updateStmt = $pdo->prepare('UPDATE steps SET paid = :paid, receipt_image = NULL, status = :status WHERE id = :id');
        if ($currentReceiptImage && file_exists('../api/' . $currentReceiptImage)) {
            unlink('../api/' . $currentReceiptImage);
        }
        if ($imagePath) {
            $fullImagePath = '/var/www/test_bot/api/' . $imagePath;
            if (file_exists($fullImagePath)) {
                unlink($fullImagePath);
            }
        }
    }
    $updateStmt->bindParam(':paid', $newPaid, PDO::PARAM_BOOL);
    $updateStmt->bindParam(':status', $newStatus, PDO::PARAM_INT);
    $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
    $updateStmt->execute();

    // Отправка сообщения в Telegram бота, если не отменено
    if ($newPaid) {
        $stmt = $pdo->prepare('SELECT id_usertg FROM steps WHERE id = :id');
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if ($user) {
            $chatId = $user['id_usertg'];
            // Отправляем сообщение с чеком
            sendTelegramMessageWithReceipt($chatId, $imagePath);
            // Отправляем сообщение с приглашением
            sendTelegramInvitationMessage($chatId);
        }
    }

    echo json_encode(['success' => true, 'paid' => $newPaid]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>