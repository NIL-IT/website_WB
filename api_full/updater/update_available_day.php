<?php
require_once 'db.php';

try {
    $pdo = getDbConnection();

    $currentDate = new DateTime('now', new DateTimeZone('Europe/Moscow'));
    $currentDateString = $currentDate->format('Y-m-d');

    $stmt = $pdo->prepare("SELECT id, available_day FROM products");
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($products as $product) {
        $id = $product['id'];
        $available_day = $product['available_day'];

        $availableDayArray = json_decode($available_day, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "Error decoding JSON for product ID $id: " . json_last_error_msg() . "\n";
            continue;
        }

        if (isset($availableDayArray[$currentDateString])) {
            $available_day_current = $availableDayArray[$currentDateString];
            $expire = false;
        } else {
            $available_day_current = 0; 
            $expire = true;

            // Проверяем, что все остальные дни равны 0
            $allDaysZero = true;
            foreach ($availableDayArray as $day => $value) {
                if ($value != 0) {
                    $allDaysZero = false;
                    break;
                }
            }

            if ($allDaysZero) {
                $available_day = '{}'; // Обновляем available_day только если все дни равны 0
            }
        }

        $updateStmt = $pdo->prepare("UPDATE products SET available_day_current = :available_day_current, expire = :expire, available_day = :available_day WHERE id = :id");
        $updateStmt->bindParam(':available_day_current', $available_day_current, PDO::PARAM_INT);
        $updateStmt->bindParam(':expire', $expire, PDO::PARAM_BOOL);
        $updateStmt->bindParam(':available_day', $available_day, PDO::PARAM_STR);
        $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $updateStmt->execute();
    }

    echo "Update successful: available_day_current and expire set based on the current date for all products.\n";

    // Перенос продуктов из pending_products в products
    $pendingStmt = $pdo->prepare("SELECT * FROM pending_products WHERE scheduled_time <= :current_date");
    $pendingStmt->bindParam(':current_date', $currentDateString, PDO::PARAM_STR);
    $pendingStmt->execute();
    $pendingProducts = $pendingStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($pendingProducts as $pendingProduct) {
        $columns = array_diff(array_keys($pendingProduct), ['scheduled_time', 'id']); // Игнорируем поле id
        $columnsList = implode(', ', $columns);
        $placeholders = implode(', ', array_map(fn($col) => ":$col", $columns));

        $insertStmt = $pdo->prepare("INSERT INTO products ($columnsList) VALUES ($placeholders)");
        foreach ($columns as $column) {
            $insertStmt->bindValue(":$column", $pendingProduct[$column]);
        }
        $insertStmt->execute();

        $deletePendingStmt = $pdo->prepare("DELETE FROM pending_products WHERE id = :id");
        $deletePendingStmt->bindParam(':id', $pendingProduct['id'], PDO::PARAM_INT);
        $deletePendingStmt->execute();
    }

    echo "Pending products with scheduled_time <= current date moved to products.\n";

    // Обновление available_day и available_day_current для продуктов с delete_date <= текущей дате
    $deleteDateStmt = $pdo->prepare("SELECT id FROM products WHERE delete_date <= :current_date AND delete_date IS NOT NULL");
    $deleteDateStmt->bindParam(':current_date', $currentDateString, PDO::PARAM_STR);
    $deleteDateStmt->execute();
    $productsToDelete = $deleteDateStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($productsToDelete as $product) {
        $productId = $product['id'];
        $emptyJson = '{}';
        $zeroValue = 0;

        $updateDeleteStmt = $pdo->prepare("UPDATE products SET available_day_current = :available_day_current, available_day = :available_day WHERE id = :id");
        $updateDeleteStmt->bindParam(':available_day_current', $zeroValue, PDO::PARAM_INT);
        $updateDeleteStmt->bindParam(':available_day', $emptyJson, PDO::PARAM_STR);
        $updateDeleteStmt->bindParam(':id', $productId, PDO::PARAM_INT);
        $updateDeleteStmt->execute();
    }

    echo "Products with delete_date <= current date updated: available_day_current and available_day set to '{}'.\n";
    
    $deleteZeroStepStmt = $pdo->prepare("DELETE FROM steps WHERE step = '0'");
    $deleteZeroStepStmt->execute();

    echo "Steps with step = 0 removed.\n";
    
    $expiredProductStmt = $pdo->prepare("SELECT id FROM products WHERE expire = true");
    $expiredProductStmt->execute();
    $expiredProducts = $expiredProductStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($expiredProducts as $product) {
        $productId = $product['id'];

        // Delete steps with step between '0' and '6' for expired products
        $deleteExpiredStepsStmt = $pdo->prepare("DELETE FROM steps WHERE id_product = :id_product AND step IN ('1', '2', '3', '4', '5', '6')");
        $deleteExpiredStepsStmt->bindParam(':id_product', $productId, PDO::PARAM_INT);
        $deleteExpiredStepsStmt->execute();
    }

    echo "Steps with step between '0' and '6' removed for expired products.\n";
  
    $threeMonthsAgo = $currentDate->sub(new DateInterval('P3M'))->format('Y-m-d');

    $stepStmt = $pdo->prepare("SELECT id, id_product, updated_at, image1, image2, image3, image4, image5, image6 FROM steps");
    $stepStmt->execute();
    $steps = $stepStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($steps as $step) {
        $stepId = $step['id'];
        $id_product = $step['id_product'];
        $updated_at = new DateTime($step['updated_at'], new DateTimeZone('Europe/Moscow'));

        if ($updated_at < new DateTime($threeMonthsAgo, new DateTimeZone('Europe/Moscow'))) {
            // Delete images
            for ($i = 1; $i <= 6; $i++) {
                $imagePath = $step["image$i"];
                if ($imagePath) {
                    $fullImagePath = '/var/www/test_bot/api/' . $imagePath;
                    if (file_exists($fullImagePath)) {
                        unlink($fullImagePath);
                    }
                }
            }
            
            // Delete the step
            $deleteStepStmt = $pdo->prepare("DELETE FROM steps WHERE id = :id");
            $deleteStepStmt->bindParam(':id', $stepId, PDO::PARAM_INT);
            $deleteStepStmt->execute();
        }
    }

    echo "Old steps removed based on updated_at date.\n";

    // Remove expired products with no associated steps
    $productStmt = $pdo->prepare("SELECT id, image_path FROM products WHERE expire = true");
    $productStmt->execute();
    $expiredProducts = $productStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($expiredProducts as $product) {
        $productId = $product['id'];
        $imagePath = $product['image_path'];

        $stepCheckStmt = $pdo->prepare("SELECT COUNT(*) FROM steps WHERE id_product = :id_product");
        $stepCheckStmt->bindParam(':id_product', $productId, PDO::PARAM_INT);
        $stepCheckStmt->execute();
        $stepCount = $stepCheckStmt->fetchColumn();

        if ($stepCount == 0) {
            // Delete product image
            if ($imagePath) {
                $fullImagePath = '/var/www/test_bot/api/' . $imagePath;
                if (file_exists($fullImagePath)) {
                    unlink($fullImagePath);
                }
            }

            // Delete the product
            $deleteProductStmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
            $deleteProductStmt->bindParam(':id', $productId, PDO::PARAM_INT);
            $deleteProductStmt->execute();
        }
    }

    echo "Expired products with no associated steps removed.\n";

} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>