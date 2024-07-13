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
        }

        $updateStmt = $pdo->prepare("UPDATE products SET available_day_current = :available_day_current, expire = :expire WHERE id = :id");
        $updateStmt->bindParam(':available_day_current', $available_day_current, PDO::PARAM_INT);
        $updateStmt->bindParam(':expire', $expire, PDO::PARAM_BOOL);
        $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $updateStmt->execute();
    }

    echo "Update successful: available_day_current and expire set based on the current date for all products.\n";
    
    $deleteZeroStepStmt = $pdo->prepare("DELETE FROM steps WHERE step = '0'");
    $deleteZeroStepStmt->execute();

    echo "Steps with step = 0 removed.\n";
    
    $expiredProductStmt = $pdo->prepare("SELECT id FROM products WHERE expire = true");
    $expiredProductStmt->execute();
    $expiredProducts = $expiredProductStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($expiredProducts as $product) {
        $productId = $product['id'];

        // Delete steps with step between '0' and '5' for expired products
        $deleteExpiredStepsStmt = $pdo->prepare("DELETE FROM steps WHERE id_product = :id_product AND step IN ('1', '2', '3', '4', '5')");
        $deleteExpiredStepsStmt->bindParam(':id_product', $productId, PDO::PARAM_INT);
        $deleteExpiredStepsStmt->execute();
    }

    echo "Steps with step between '0' and '5' removed for expired products.\n";
  
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