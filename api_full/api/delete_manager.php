<?php
header('Content-Type: application/json');
include 'db.php';
include 'cors.php';

$data = json_decode(file_get_contents("php://input"), true);
$id_usertg = $data['id_usertg'] ?? null;
$id = $data['id'] ?? null;

if (!$id_usertg || !$id) {
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

    // Удаление менеджера
    $stmt = $conn->prepare("DELETE FROM managers WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
