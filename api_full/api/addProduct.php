<?php
header('Content-Type: application/json');
include 'cors.php';  
require 'db.php';   

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}


$brand = $data['brand'];
$name = $data['name'];
$category = $data['category'];
$imageData = $data['image'];
$availableDay = $data['availableDay'];
$keywords = $data['keywords'];
$article = $data['article'];
$tg_nick = $data['tg_nick'];
$terms = $data['terms'];
$marketPrice = $data['marketPrice'];
$yourPrice = $data['yourPrice'];
$amountMax = $data['amountMax'];

$imageDirectory = 'uploads/';

if (!is_dir($imageDirectory)) {
    mkdir($imageDirectory, 0755, true);
}

$imageName = uniqid() . '.png';
$imagePath = $imageDirectory . $imageName;

$imageDecoded = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $imageData));
file_put_contents($imagePath, $imageDecoded);

try {
    $conn = getDbConnection();


    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM products WHERE article = :article");
    $checkStmt->bindParam(':article', $article, PDO::PARAM_STR);
    $checkStmt->execute();
    $count = $checkStmt->fetchColumn();

    if ($count > 0) {
        echo json_encode(["success" => false, "message" => "Товар с данным артиклем уже выставлен, для удаления обратитесь в поддержку"]);
        exit;
    }


    $stmt = $conn->prepare("
        INSERT INTO products (
            brand, name, category, image_path, available_day, keywords, article, tg_nick, terms, market_price, your_price, amount_max
        ) VALUES (
            :brand, :name, :category, :imagePath, :availableDay, :keywords, :article, :tg_nick, :terms, :marketPrice, :yourPrice, :amountMax
        )
    ");
    $stmt->bindParam(':brand', $brand);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':imagePath', $imagePath);
    $stmt->bindParam(':availableDay', $availableDay);
    $stmt->bindParam(':keywords', $keywords);
    $stmt->bindParam(':article', $article);
    $stmt->bindParam(':tg_nick', $tg_nick);
    $stmt->bindParam(':terms', $terms);
    $stmt->bindParam(':marketPrice', $marketPrice);
    $stmt->bindParam(':yourPrice', $yourPrice);
    $stmt->bindParam(':amountMax', $amountMax);

    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Product added successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>