<?php
header('Content-Type: application/json');
include 'cors.php';
require_once 'db.php';

try {
    // Получение соединения с базой данных
    $pdo = getDbConnection();

    // Получение данных из запроса
    $data = json_decode(file_get_contents('php://input'), true);

    // Проверка наличия необходимых данных
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    $id = $data['id'];

    // Запрос к таблице steps
    $stmt = $pdo->prepare('SELECT * FROM steps WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $step = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($step) {
        // Получение id_product из таблице steps
        $id_product = $step['id_product'];

        // Запрос к таблице products
        $stmt = $pdo->prepare('SELECT tg_nick, market_price, your_price FROM products WHERE id = :id_product');
        $stmt->bindParam(':id_product', $id_product, PDO::PARAM_INT);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($product) {
            $tg_nick = $product['tg_nick'];
            $market_price = $product['market_price'];
            $your_price = $product['your_price'];
            $benefit = $market_price - $your_price;

            // Получаем id_usertg из steps и ищем пользователя по нему.
            $id_usertg = isset($step['id_usertg']) ? $step['id_usertg'] : null;
            if ($id_usertg) {
                $stmt = $pdo->prepare('SELECT id_usertg, username, confirmation_image, confirmation FROM users WHERE id_usertg = :id_usertg LIMIT 1');
                $stmt->bindParam(':id_usertg', $id_usertg, PDO::PARAM_STR);
                $stmt->execute();
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            // Добавление префикса к URL изображениям шагов
            for ($i = 1; $i <= 7; $i++) {
                if (!empty($step["image$i"])) {
                    $step["image$i"] = 'https://inhomeka.online:8000/' . ltrim($step["image$i"], '/');
                }
            }

            // Добавление префикса к URL для receipt_image
            if (!empty($step['receipt_image'])) {
                $step['receipt_image'] = 'https://inhomeka.online:8000/' . ltrim($step['receipt_image'], '/');
            }

            // Добавление префикса для confirmation_image пользователя, если есть
            if ($user && !empty($user['confirmation_image'])) {
                $user['confirmation_image'] = 'https://inhomeka.online:8000/' . ltrim($user['confirmation_image'], '/');
            }

            // Добавление значения выгоды и комментария в ответ
            $response = [
                'success' => true,
                'data' => $step,
                'benefit' => $benefit,
                'comment' => $step['comment'],
                'modified_payment' => $step['modified_payment'],
                'user' => $user // добавляем объект пользователя в ответ (включает id_usertg и username)
            ];

            echo json_encode($response);
        } else {
            echo json_encode(['success' => false, 'error' => 'Product not found']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Step not found']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>