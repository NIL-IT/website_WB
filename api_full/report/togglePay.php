<?php
header('Content-Type: application/json');
include 'cors.php'; // Включение CORS, если необходимо
require_once 'db.php'; // Подключение к базе данных

function convertToPng($imageData, $extension) {
    $image = null;
    switch ($extension) {
        case 'jpeg':
        case 'jpg':
            $image = imagecreatefromjpeg($imageData);
            break;
        case 'webp':
            $image = imagecreatefromwebp($imageData);
            break;
        case 'png':
            $image = imagecreatefrompng($imageData);
            break;
        default:
            return false;
    }
    
    if (!$image) return false;
    
    ob_start();
    imagepng($image);
    $pngData = ob_get_contents();
    ob_end_clean();
    imagedestroy($image);
    
    return $pngData;
}

function saveImage($base64String) {
    $imageDirectory = '../api/uploads/';
    if (!is_dir($imageDirectory)) {
        mkdir($imageDirectory, 0755, true);
    }
    
    if (preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,/', $base64String, $matches)) {
        $extension = strtolower($matches[1]);
        $base64String = preg_replace('/^data:image\/(jpeg|jpg|png|webp);base64,/', '', $base64String);
        $imageData = base64_decode($base64String);
        
        $pngData = convertToPng($imageData, $extension);
        if (!$pngData) return false;
        
        $imageName = uniqid() . '.png';
        $imagePath = $imageDirectory . $imageName;
        
        if (!file_put_contents($imagePath, $pngData)) {
            return false;
        }
        
        return 'uploads/' . $imageName;
    }
    return false;
}

function sendTelegramMessageWithReceipt($chatId, $imagePath) {
    $botToken = "7088761576:AAG2JhO4r1MTZ4aC5YpmRhzYs8OaGz1KV90";
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
    $botToken = "7088761576:AAG2JhO4r1MTZ4aC5YpmRhzYs8OaGz1KV90";
    $apiUrl = "https://api.telegram.org/bot$botToken/sendMessage";

    $message1 = "🎉 Приглашайте в закрытый клуб своих друзей, чтобы они тоже могли покупать с выгодой и участвовать в развитии бренда. Чтобы пригласить друга - просто перешлите ему сообщение ниже:";
    
    $postFields1 = [
        'chat_id' => $chatId,
        'text' => $message1,
        'parse_mode' => 'HTML'
    ];
    sendTelegramRequest($apiUrl, $postFields1);

    $message2 = "Привет! Я нашел закрытый клуб бренда товаров для дома INHOMEKA, там раздают товары бренда с кэшбеком 80-100%, а еще можно поучаствовать в развитии бренда и получить за это бонусы! 🎁\n\n"
        . "🔵 Это моя <a href='https://t.me/wb_cashback_nsk_bot'>персональная пригласительная ссылка</a> для тебя.\n"
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
    $pdo = getDbConnection();
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }
    
    $id = $data['id'];
    $imagePath = isset($data['receipt']) ? saveImage($data['receipt']) : null;
    
    if ($imagePath === false) {
        echo json_encode(['success' => false, 'error' => 'Failed to process image']);
        exit;
    }
    
    $stmt = $pdo->prepare('SELECT paid, status, receipt_image, id_usertg FROM steps WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!in_array($row['status'], [1, 2, 3])) {
        echo json_encode(['success' => false, 'error' => 'Invalid status']);
        exit;
    }
    
    $newPaid = !$row['paid'];
    $newStatus = $newPaid ? 3 : 2;
    
    if ($newPaid) {
        sendTelegramMessageWithReceipt($row['id_usertg'], $imagePath);
        sendTelegramInvitationMessage($row['id_usertg']);
    }
    
    echo json_encode(['success' => true, 'paid' => $newPaid]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
