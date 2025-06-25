<?php
require_once 'db.php';
require_once 'cors.php';
header('Content-Type: application/json');

try {
    $pdo = getDbConnection();

    $manager_username = 'marina_WB2023';

    // Получаем все товары этого менеджера
    $stmt = $pdo->prepare("SELECT id, market_price, your_price FROM products WHERE tg_nick_manager = ?");
    $stmt->execute([$manager_username]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total_sum = 0;
    $total_count = 0;
    $count_status_0 = 0;
    $count_status_1 = 0;
    $count_status_2 = 0;
    $count_status_3 = 0;

    foreach ($products as $product) {
        $product_id = $product['id'];
        $market_price = floatval($product['market_price']);
        $your_price = floatval($product['your_price']);

        // Получаем только нужные steps
        $stmtSteps = $pdo->prepare(
            "SELECT modified_payment, status FROM steps WHERE id_product = ? AND step = 'Завершено' AND (status = 0 OR status = 1 OR status = 2 OR status = 3)"
        );
        $stmtSteps->execute([$product_id]);
        $steps = $stmtSteps->fetchAll(PDO::FETCH_ASSOC);

        foreach ($steps as $step) {
            $total_count++;
            if ($step['status'] == 0) $count_status_0++;
            if ($step['status'] == 1) $count_status_1++;
            if ($step['status'] == 2) $count_status_2++;
            if ($step['status'] == 3) $count_status_3++;
            // В сумму не включаем статус 3
            if ($step['status'] == 0 || $step['status'] == 1 || $step['status'] == 2) {
                $modified_payment = $step['modified_payment'];
                if ($modified_payment !== null && $modified_payment !== '') {
                    $total_sum += floatval($modified_payment);
                } else {
                    $total_sum += ($market_price - $your_price);
                }
            }
        }
    }

    echo json_encode([
        'success' => true,
        'manager_username' => $manager_username,
        'sum' => $total_sum,
        'count' => $total_count,
        'count_status_0' => $count_status_0,
        'count_status_1' => $count_status_1,
        'count_status_2' => $count_status_2,
        'count_status_3' => $count_status_3
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
