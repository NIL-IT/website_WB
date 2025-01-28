<?php
header('Content-Type: application/json');
include 'cors.php'; // Включение CORS, если необходимо
require_once 'db.php'; // Подключение к базе данных

try {
    // Получение соединения с базой данных
    $pdo = getDbConnection();

    // Проверка наличия ID
    if (!isset($_POST['id'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    $id = $_POST['id'];

    // Обработка изображения
    $imagePath = null;
    if (isset($_FILES['receipt']) && $_FILES['receipt']['error'] === UPLOAD_ERR_OK) {
        $imageDirectory = '../api/uploads/';
        if (!is_dir($imageDirectory)) {
            mkdir($imageDirectory, 0755, true);
        }

        $imageTmpPath = $_FILES['receipt']['tmp_name'];
        $imageName = uniqid() . '.' . pathinfo($_FILES['receipt']['name'], PATHINFO_EXTENSION);
        $imagePath = $imageDirectory . $imageName;

        if (!move_uploaded_file($imageTmpPath, $imagePath)) {
            echo json_encode(['success' => false, 'error' => 'Failed to save image']);
            exit;
        }
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
        $updateStmt = $pdo->prepare('UPDATE steps SET paid = :paid, status = :status WHERE id = :id');
        if ($currentReceiptImage && file_exists($currentReceiptImage)) {
            unlink($currentReceiptImage);
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