<?php
header('Content-Type: application/json');
include 'cors.php';
require 'db.php';

try {
    $data = $_POST; // ожидается FormData: id_usertg, screenshot (dataURL)

    if (!isset($data['id_usertg']) || empty($data['id_usertg'])) {
        echo json_encode(['success' => false, 'error' => 'Missing id_usertg']);
        exit;
    }

    if (!isset($data['screenshot']) || empty($data['screenshot'])) {
        echo json_encode(['success' => false, 'error' => 'Missing screenshot data']);
        exit;
    }

    $id_usertg = $data['id_usertg'];
    $imageData = $data['screenshot'];

    // Директория для загрузок (относительно этого файла)
    $uploadDir = __DIR__ . '/uploads/';
    $publicPathDir = 'uploads/';

    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            echo json_encode(['success' => false, 'error' => 'Failed to create upload directory']);
            exit;
        }
    }

    // Генерация имени файла
    $imageName = 'confirm_' . uniqid() . '.png';
    $imagePathFull = $uploadDir . $imageName;
    $imagePathPublic = $publicPathDir . $imageName;

    // Декодирование base64 (удаляем префикс data:image/...;base64,)
    $imageDecoded = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));

    if ($imageDecoded === false) {
        echo json_encode(['success' => false, 'error' => 'Invalid image data']);
        exit;
    }

    if (file_put_contents($imagePathFull, $imageDecoded) === false) {
        echo json_encode(['success' => false, 'error' => 'Failed to save image file']);
        exit;
    }

    // Сохраняем путь в БД и ставим confirmation = true (1)
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("UPDATE users SET confirmation = true, confirmation_image = :img WHERE id_usertg = :id_usertg");
    $stmt->bindParam(':img', $imagePathPublic, PDO::PARAM_STR);
    $stmt->bindParam(':id_usertg', $id_usertg, PDO::PARAM_INT);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Confirmation image saved and confirmation set to true', 'image' => $imagePathPublic]);
        } else {
            // Возможно, пользователь с таким id_usertg не найден
            echo json_encode(['success' => false, 'error' => 'User not found or no changes made']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Database update failed']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
}
?>
