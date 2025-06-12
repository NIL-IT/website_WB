<?php
header('Content-Type: application/json');
include 'db.php';
include 'cors.php';

$data = json_decode(file_get_contents("php://input"), true);
$id_usertg = $data['id_usertg'] ?? null;
$manager_username = $data['manager_username'] ?? null;

if (!$id_usertg || !$manager_username) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

try {
    $conn = getDbConnection();
    // Проверка на админа
    $stmt = $conn->prepare("SELECT * FROM users WHERE id_userTG = :id_usertg AND status = 'admin'");
    $stmt->bindParam(':id_usertg', $id_usertg, PDO::PARAM_INT);
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        echo json_encode(['success' => false, 'message' => 'Not admin']);
        exit;
    }

    // Проверка, существует ли уже такой менеджер
    $stmt = $conn->prepare("SELECT * FROM managers WHERE manager_username = :manager_username");
    $stmt->bindParam(':manager_username', $manager_username, PDO::PARAM_STR);
    $stmt->execute();
    if ($stmt->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode(['success' => false, 'message' => 'Manager already exists']);
        exit;
    }

    // Поиск пользователя по username
    $stmt = $conn->prepare("SELECT id_userTG FROM users WHERE username = :manager_username");
    $stmt->bindParam(':manager_username', $manager_username, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    $manager_id = $user['id_userTG'];

    // Добавление менеджера с manager_id и balance = 0
    $stmt = $conn->prepare("INSERT INTO managers (manager_username, manager_id, balance) VALUES (:manager_username, :manager_id, 0)");
    $stmt->bindParam(':manager_username', $manager_username, PDO::PARAM_STR);
    $stmt->bindParam(':manager_id', $manager_id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
