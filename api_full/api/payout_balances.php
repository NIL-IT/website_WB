<?php
require_once 'db.php';
require_once 'cors.php';
header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents("php://input"), true);
    $id_usertg = $input['id_usertg'] ?? null;

    if (!$id_usertg) {
        echo json_encode(['success' => false, 'message' => 'id_usertg required']);
        exit;
    }

    $pdo = getDbConnection();

    // Проверка статуса админа
    $stmt = $pdo->prepare("SELECT status FROM users WHERE id_userTG = ?");
    $stmt->execute([$id_usertg]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['status'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Нет доступа']);
        exit;
    }

    // Получаем всех менеджеров
    $managers = $pdo->query("SELECT id, manager_username, balance FROM managers")->fetchAll(PDO::FETCH_ASSOC);

    $result = [];

    foreach ($managers as $manager) {
        $manager_id = $manager['id'];
        $manager_username = $manager['manager_username'];
        $balance = floatval($manager['balance']);

        // Получаем все продукты этого менеджера
        $products = $pdo->prepare("SELECT id, market_price, your_price FROM products WHERE tg_nick_manager = ?");
        $products->execute([$manager_username]);
        $products = $products->fetchAll(PDO::FETCH_ASSOC);

        $sum = 0;
        $request = 0;

        foreach ($products as $product) {
            $product_id = $product['id'];
            // Получаем все шаги с нужным статусом
            $steps = $pdo->prepare("SELECT modified_payment FROM steps WHERE id_product = ? AND (status = 1 OR status = 2)");
            $steps->execute([$product_id]);
            $steps = $steps->fetchAll(PDO::FETCH_ASSOC);

            foreach ($steps as $step) {
                $request++;
                $modified_payment = $step['modified_payment'];
                if ($modified_payment !== null && $modified_payment !== '') {
                    $sum -= floatval($modified_payment);
                } else {
                    // Если нет modified_payment, считаем market_price - your_price
                    $sum -= floatval($product['market_price']) - floatval($product['your_price']);
                }
            }
        }

        $amount = $sum + $balance;

        $result[] = [
            'id' => $manager_id,
            'manager_username' => $manager_username,
            'amount' => $amount,
            'request' => $request
        ];
    }

    echo json_encode(['success' => true, 'data' => $result]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
