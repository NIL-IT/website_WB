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
    // Check if a product with the same article already exists
    $stmt = $conn->prepare("SELECT COUNT(*) FROM products WHERE article = :article");
    $stmt->bindParam(':article', $article);
    $stmt->execute();
    $count = $stmt->fetchColumn();

    if ($count > 0) {
        echo json_encode(["success" => false, "message" => "Данный товар уже выставлен, для удаления обратитесь в поддержку"]);
        exit;
    }

    // Image handling: Create directory if it doesn't exist
    $imageDirectory = 'uploads/';
    if (!is_dir($imageDirectory)) {
        mkdir($imageDirectory, 0755, true);
    }

    // Decode base64 image data and save to a unique filename
    $imageData = $data['image'];  // Assuming 'image' is the key for image data in $data
    $imageName = uniqid() . '.png';
    $imagePath = $imageDirectory . $imageName;

    $imageDecoded = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));

    if ($imageDecoded === false) {
        echo json_encode(["success" => false, "message" => "Failed to decode image data"]);
        exit;
    }

    // Save decoded image data to file
    if (file_put_contents($imagePath, $imageDecoded)) {
        // Fetch availableDay from data
        $availableDay = $data['availableDay'];

        // Convert availableDay array into JSON string
        $availableDayJson = json_encode($availableDay);

        // Get the first value from the availableDay array
        reset($availableDay); // Move the internal pointer to the first element
        $availableDayCurrent = current($availableDay); // Get the first element's value

        // Insert product details into database including is_confirmed
        $insertStmt = $conn->prepare("
            INSERT INTO products (
                brand, name, category, image_path, available_day, available_day_current, keywords, article, tg_nick, terms, market_price, your_price, is_confirmed, expire
            ) VALUES (
                :brand, :name, :category, :imagePath, :availableDayJson, :availableDayCurrent, :keywords, :article, :tg_nick, :terms, :marketPrice, :yourPrice, :isConfirmed, :expire
            )
        ");

        $isConfirmed = false; // Set default value for is_confirmed

        $insertStmt->bindParam(':brand', $data['brand']);
        $insertStmt->bindParam(':name', $data['name']);
        $insertStmt->bindParam(':category', $data['category']);
        $insertStmt->bindParam(':imagePath', $imagePath);
        $insertStmt->bindParam(':availableDayJson', $availableDayJson, PDO::PARAM_STR); // Store as JSON string
        $insertStmt->bindParam(':availableDayCurrent', $availableDayCurrent); // Store the first value from availableDay array
        $insertStmt->bindParam(':keywords', $data['keywords']);
        $insertStmt->bindParam(':article', $data['article']);
        $insertStmt->bindParam(':tg_nick', $data['tg_nick']);
        $insertStmt->bindParam(':terms', $data['terms']);
        $insertStmt->bindParam(':marketPrice', $data['marketPrice']);
        $insertStmt->bindParam(':yourPrice', $data['yourPrice']);
        $insertStmt->bindParam(':isConfirmed', $isConfirmed, PDO::PARAM_BOOL); // Bind is_confirmed as boolean
        $insertStmt->bindParam(':expire', $isConfirmed, PDO::PARAM_BOOL);
        

        $insertStmt->execute();

        echo json_encode(["success" => true, "message" => "Product added successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to save image"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>