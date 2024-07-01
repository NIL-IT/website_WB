<?php
header('Content-Type: application/json');
require 'cors.php';
require 'db.php';

function getAllProducts($conn) {
    $query = "SELECT 
                id,
                image_path AS image,
                name,
                terms,
                available_day_current AS availableDay,
                market_price AS marketPrice,
                your_price AS yourPrice,
                keywords,
                article,
                category
            FROM products";
    $stmt = $conn->prepare($query);
    
    if ($stmt->execute()) {
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($products as &$product) {
            $imagePath = $product['image'];
            if (file_exists($imagePath)) {
                $product['image'] = 'https://nilurl.ru:8000/' . $imagePath;
            } else {
                $product['image'] = null;
            }
        }
        return $products;
    } else {
        return false;
    }
}

$response = [
    'success' => false,
    'data' => [],
    'error' => null
];

try {
    $conn = getDbConnection();
    $products = getAllProducts($conn);

    if ($products !== false) {
        $response['success'] = true;
        $response['data'] = $products;
    } else {
        $response['error'] = 'Failed to fetch products';
    }
} catch (PDOException $e) {
    $response['error'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
?>