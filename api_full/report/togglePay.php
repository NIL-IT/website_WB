<?php
header('Content-Type: application/json');
include 'cors.php'; // Включение CORS, если необходимо
require_once 'db.php'; // Подключение к базе данных

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

    echo json_encode(['success' => true, 'paid' => $newPaid]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>