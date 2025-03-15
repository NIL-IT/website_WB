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
                available_day_current AS availableday,
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

        // Sort products by cashback percentage and availableday
                // Разделяем товары
        $productsWithAvailableDay = [];
        $productsWithoutAvailableDay = [];

        foreach ($filteredProducts as $product) {
            if ($product['availableDay'] > 0) {
                $productsWithAvailableDay[] = $product;
            } else {
                $productsWithoutAvailableDay[] = $product;
            }
        }

        // Функция сортировки по кэшбеку
        $sortByCashback = function ($a, $b) {
            $cashbackPercentageA = ((float)$a['marketPrice'] - (float)$a['yourPrice']) / (float)$a['marketPrice'];
            $cashbackPercentageB = ((float)$b['marketPrice'] - (float)$b['yourPrice']) / (float)$b['marketPrice'];

            return $cashbackPercentageB <=> $cashbackPercentageA;
        };

        // Сортируем каждую группу по кэшбеку
        usort($productsWithAvailableDay, $sortByCashback);
        usort($productsWithoutAvailableDay, $sortByCashback);

        // Объединяем массивы
        $filteredProducts = array_merge($productsWithAvailableDay, $productsWithoutAvailableDay);

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