<?php
header('Content-Type: application/json');
include 'cors.php';
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

$article = $data['article'];
$conn = getDbConnection();

try {
    $imageDirectory = 'uploads/';
    if (!is_dir($imageDirectory)) {
        mkdir($imageDirectory, 0755, true);
    }

    $imageData = $data['image'];
    $imageName = uniqid() . '.png';
    $imagePath = $imageDirectory . $imageName;
    $imageDecoded = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));

    if ($imageDecoded === false) {
        echo json_encode(["success" => false, "message" => "Failed to decode image data"]);
        exit;
    }

    if (file_put_contents($imagePath, $imageDecoded)) {
        $availableDay = $data['availableDay'];
        $availableDayJson = json_encode($availableDay);

        $availableDaySum = array_sum($availableDay);

        if (!empty($data['keywordsWithCount'])) {
            $keywordsWithCount = $data['keywordsWithCount'];
            $keywordsWithCountJson = json_encode($keywordsWithCount, JSON_UNESCAPED_UNICODE);
        } 

        $keywordsWithCountSum = 0;
        foreach ($keywordsWithCount as $keyword) {
            $keywordsWithCountSum += intval(current($keyword));
        }

        if ($keywordsWithCountSum > $availableDaySum) {
            echo json_encode([
                "success" => false,
                "message" => "Сумма выдачи ключевых слов превосходит количество доступного товара"
            ]);
            exit;
        }

        // Получаем значение keywords как обычную строку
        $keywords = isset($data['keywords']) ? $data['keywords'] : null;

        $insertStmt = $conn->prepare("
            INSERT INTO products (
                brand, name, category, image_path, available_day, available_day_current, keywords_with_count, article, tg_nick, terms, market_price, your_price, is_confirmed, expire, keywords
            ) VALUES (
                :brand, :name, :category, :imagePath, :availableDayJson, :availableDayCurrent, :keywordsWithCountJson, :article, :tg_nick, :terms, :marketPrice, :yourPrice, :isConfirmed, :expire, :keywords
            )
        ");

        $isConfirmed = false;
        
        $insertStmt->bindParam(':brand', $data['brand']);
        $insertStmt->bindParam(':name', $data['name']);
        $insertStmt->bindParam(':category', $data['category']);
        $insertStmt->bindParam(':imagePath', $imagePath);
        $insertStmt->bindParam(':availableDayJson', $availableDayJson, PDO::PARAM_STR);
        reset($availableDay);
        $availableDayCurrent = current($availableDay);
        $insertStmt->bindParam(':availableDayCurrent', $availableDayCurrent);
        $insertStmt->bindParam(':keywordsWithCountJson', $keywordsWithCountJson, PDO::PARAM_STR);
        $insertStmt->bindParam(':article', $data['article']);
        $insertStmt->bindParam(':tg_nick', $data['tg_nick']);
        $insertStmt->bindParam(':terms', $data['terms']);
        $insertStmt->bindParam(':marketPrice', $data['marketPrice']);
        $insertStmt->bindParam(':yourPrice', $data['yourPrice']);
        $insertStmt->bindParam(':isConfirmed', $isConfirmed, PDO::PARAM_BOOL);
        $insertStmt->bindParam(':expire', $isConfirmed, PDO::PARAM_BOOL);
        $insertStmt->bindParam(':keywords', $keywords, PDO::PARAM_STR); // Привязываем keywords как обычную строку

        $insertStmt->execute();

        echo json_encode(["success" => true, "message" => "Product added successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to save image"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>

