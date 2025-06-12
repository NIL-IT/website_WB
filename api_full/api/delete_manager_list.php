<?php
header('Content-Type: application/json');
include 'db.php';
include 'cors.php';

$data = json_decode(file_get_contents("php://input"), true);
$id_usertg = $data['id_usertg'] ?? null;

if (!$id_usertg) {
    echo json_encode(['success' => false, 'message' => 'Missing id_usertg']);
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

    // Получение списка менеджеров
    $stmt = $conn->query("SELECT id, manager_username FROM managers");
    $managers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $managers]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
