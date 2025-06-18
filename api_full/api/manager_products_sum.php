<?php
require_once 'db.php';
require_once 'cors.php';
header('Content-Type: application/json');

try {
    $pdo = getDbConnection();

    $manager_username = 'kenariilw';

    // Получаем все товары этого менеджера
    $stmt = $pdo->prepare("SELECT id, market_price, your_price FROM products WHERE tg_nick_manager = ?");
    $stmt->execute([$manager_username]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total_sum = 0;
    $total_count = 0;

    foreach ($products as $product) {
        $product_id = $product['id'];
        $market_price = floatval($product['market_price']);
        $your_price = floatval($product['your_price']);

        // Получаем только нужные steps
        $stmtSteps = $pdo->prepare(
            "SELECT modified_payment FROM steps WHERE id_product = ? AND step = 'Завершено' AND (status = 1 OR status = 2)"
        );
        $stmtSteps->execute([$product_id]);
        $steps = $stmtSteps->fetchAll(PDO::FETCH_ASSOC);

        foreach ($steps as $step) {
            $total_count++;
            $modified_payment = $step['modified_payment'];
            if ($modified_payment !== null && $modified_payment !== '') {
                $total_sum += floatval($modified_payment);
            } else {
                $total_sum += ($market_price - $your_price);
            }
        }
    }

    echo json_encode([
        'success' => true,
        'manager_username' => $manager_username,
        'sum' => $total_sum,
        'count' => $total_count
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
