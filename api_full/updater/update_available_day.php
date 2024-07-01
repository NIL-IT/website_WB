<?php
require_once 'db.php';

try {
    $pdo = getDbConnection();


    $stmt = $pdo->prepare("SELECT id, amount_max, available_day FROM products");
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($products as $product) {
        $id = $product['id'];
        $amount_max = $product['amount_max'];
        $available_day = $product['available_day'];
        
        if ($amount_max < $available_day) {
            $available_day_current = $amount_max;
        } else {
            $available_day_current = $available_day;
        }

        $updateStmt = $pdo->prepare("UPDATE products SET available_day_current = :available_day_current WHERE id = :id");
        $updateStmt->bindParam(':available_day_current', $available_day_current, PDO::PARAM_INT);
        $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $updateStmt->execute();
    }

    echo "Update successful: available_day_current set based on amount_max and available_day for all products.\n";
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>