<?php

header('Content-Type: application/json');
include 'cors.php'; // Включение CORS, если необходимо
require_once 'db.php'; // Подключение к базе данных
require_once __DIR__ . '/../proxy/sendTelegramProxy.php';


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

    // Получение текущей даты и времени
    $receiptTimestamp = $newPaid ? date('Y-m-d H:i:s') : null;

    // Обновление значения paid, пути к изображению, комментария и времени прикладывания чека в таблице steps
    $newStatus = $newPaid ? 3 : 2;
    if ($newPaid) {
        $updateStmt = $pdo->prepare('UPDATE steps SET paid = :paid, receipt_image = :receipt_image, status = :status, receipt_timestamp = :receipt_timestamp WHERE id = :id');
        $updateStmt->bindParam(':receipt_image', $imagePath, PDO::PARAM_STR);
        $updateStmt->bindParam(':receipt_timestamp', $receiptTimestamp, PDO::PARAM_STR);
    } else {
        $updateStmt = $pdo->prepare('UPDATE steps SET paid = :paid, receipt_image = NULL, status = :status, receipt_timestamp = NULL WHERE id = :id');
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
    $stmt = $pdo->prepare('SELECT id_usertg, id_product FROM steps WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $userStep = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($userStep) {
        $chatId = $userStep['id_usertg'];
        $id_product = $userStep['id_product'];

        // Получаем tg_nick_manager, market_price, your_price из products
        $stmt = $pdo->prepare('SELECT tg_nick_manager, market_price, your_price FROM products WHERE id = :id_product');
        $stmt->bindParam(':id_product', $id_product, PDO::PARAM_INT);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        // Получаем modified_payment из steps
        $stmt = $pdo->prepare('SELECT modified_payment FROM steps WHERE id = :id');
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $stepData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($product && !empty($product['tg_nick_manager'])) {
            $manager_username = $product['tg_nick_manager'];

            // Получаем manager_id и balance из managers
            $stmt = $pdo->prepare('SELECT manager_id, balance FROM managers WHERE manager_username = :manager_username');
            $stmt->bindParam(':manager_username', $manager_username, PDO::PARAM_STR);
            $stmt->execute();
            $manager = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($manager) {
                $manager_id = $manager['manager_id'];
                $balance = $manager['balance'];

                // Определяем сумму для изменения
                $sum = $stepData['modified_payment'];
                if ($sum === null) {
                    $sum = $product['market_price'] - $product['your_price'];
                }

                // Если оплачено — вычитаем, если отменено — возвращаем
                if ($newPaid) {
                    $new_balance = $balance - $sum;
                } else {
                    $new_balance = $balance + $sum;
                }
                $stmt = $pdo->prepare('UPDATE managers SET balance = ? WHERE manager_id = ?');
                $stmt->execute([$new_balance, $manager_id]);
            }
        }

        if ($newPaid) {
            // Отправляем сообщение с чеком
            sendTelegramMessageWithReceipt($chatId, $imagePath);
            // Отправляем сообщение с приглашением (передаем id_usertg)
            sendTelegramInvitationMessage($chatId, $chatId);
        }
    }

    // Отправка уведомления админу, если paid становится false
    if ($currentPaid && !$newPaid) {
        sendAdminNotification("Внимание! paid был снят для отчёта ID: $id");
    }

    echo json_encode(['success' => true, 'paid' => $newPaid]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>