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
    if (!isset($data['id'], $data['id_usertg'], $data['status'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        exit;
    }

    $id = $data['id'];
    $id_usertg = $data['id_usertg'];
    $user_status = $data['status'];

    // Запрос к таблице steps
    $stmt = $pdo->prepare('SELECT * FROM steps WHERE id = :id');
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $step = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($step) {
        // Получение id_product из таблице steps
        $id_product = $step['id_product'];

        // Запрос к таблице products
        $stmt = $pdo->prepare('SELECT tg_nick FROM products WHERE id = :id_product');
        $stmt->bindParam(':id_product', $id_product, PDO::PARAM_INT);
        $stmt->execute();
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($product) {
            $tg_nick = $product['tg_nick'];

            // Запрос к таблице users
            $stmt = $pdo->prepare('SELECT id_usertg FROM users WHERE username = :tg_nick');
            $stmt->bindParam(':tg_nick', $tg_nick, PDO::PARAM_STR);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user_status === 'admin' || ($user && $user['id_usertg'] == $id_usertg)) {
                // Добавление префикса к URL изображениям
                for ($i = 1; $i <= 7; $i++) {
                    if (!empty($step["image$i"])) {
                        $step["image$i"] = 'https://inhomeka.online:8000/' . $step["image$i"];
                    }
                }

                echo json_encode(['success' => true, 'data' => $step]);
            } else {
                echo json_encode(['success' => false, 'error' => 'User not found or mismatch']);
            }
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