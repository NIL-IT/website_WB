<?php
header('Content-Type: application/json');
include 'db.php';
include 'cors.php';

try {
    $conn = getDbConnection();
    $stmt = $conn->query("SELECT id, manager_username FROM managers");
    $managers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => $managers
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Query failed: " . $e->getMessage()
    ]);
}
?>
