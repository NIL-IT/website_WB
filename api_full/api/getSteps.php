<?php

include 'db.php';
include 'cors.php';

function getUserSteps($id_usertg) {
    $pdo = getDbConnection();
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                s.id,
                s.step,
                s.cardholder,
                s.bankname,
                s.phone,
                s.cardnumber,
                s.id_product,
                p.name, 
                p.image_path AS image, 
                p.article,
                p.available_day_current AS availableday, 
                p.terms,
                p.tg_nick,
                p.keywords,
                p.market_price AS marketPrice, 
                p.your_price AS yourPrice,
                p.expire
            FROM 
                steps s
            JOIN 
                products p ON s.id_product = p.id
            WHERE 
                s.id_usertg = :id_usertg
        ");
        
        $stmt->execute(['id_usertg' => $id_usertg]);
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $filteredResults = [];

        foreach ($results as $row) {
            // Проверяем, если expire = true и step < 5, то пропускаем элемент
            if ($row['expire'] === true && $row['step'] <= 5 && $row['step'] !== 'Завершено') {
                continue;
            }

            $imagePath = $row['image'];
            $row['image'] = 'https://testingnil.ru:8000/' . $imagePath;
            $filteredResults[] = $row;
        }

        echo json_encode(['success' => true, 'data' => $filteredResults]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

if (isset($_GET['id_usertg'])) {
    $id_usertg = $_GET['id_usertg'];
    getUserSteps($id_usertg);
} else {
    echo json_encode(['success' => false, 'message' => 'No id_usertg provided']);
}

?>