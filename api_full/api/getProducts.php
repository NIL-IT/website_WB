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
                available_day AS availabledays,
                market_price AS marketPrice,
                your_price AS yourPrice,
                keywords,
                article,
                tg_nick,
                category,
                expire,
                is_confirmed
            FROM products";
    $stmt = $conn->prepare($query);
    
    if ($stmt->execute()) {
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $filteredProducts = [];

        foreach ($products as $product) {
            // Check if the product should be excluded based on 'expire'
            if ($product['expire'] !== true) {
                $imagePath = $product['image'];
                if (file_exists($imagePath)) {
                    $product['image'] = 'https://inhomeka.online:8000/' . $imagePath;
                } else {
                    $product['image'] = null;
                }

                // Decode the available_day field from JSON string to an array
                $product['availabledays'] = json_decode($product['availabledays'], true);

                // Add product to filtered list
                $filteredProducts[] = $product;
            }
        }

        return $filteredProducts;
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