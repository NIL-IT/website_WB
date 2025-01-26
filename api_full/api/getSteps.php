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
                p.keywords_with_count,
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
            if (filter_var($row['expire'], FILTER_VALIDATE_BOOLEAN) && $row['step'] < 5 && $row['step'] !== 'Завершено') {
                continue;
            }
        
            // Если keywords пустой, извлекаем данные из keywords_with_count
            if (empty($row['keywords'])) {
                $keywordsWithCount = json_decode($row['keywords_with_count'], true);
                
                if (is_array($keywordsWithCount)) {
                    foreach ($keywordsWithCount as $keyword) {
                        $key = key($keyword);
                        $value = current($keyword);
        
                        // Найти первый ключ с ненулевым значением
                        if ($value > 0) {
                            $row['keywords'] = $key;
                            break;
                        }
                    }
                }
            }
        
            // Добавляем полный URL для изображения
            $row['image'] = 'https://testingnil6.ru:8000/' . $row['image'];
            $filteredResults[] = $row;
        }

        echo json_encode(['success' => true, 'data' => $filteredResults]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id_usertg']) && !empty($data['id_usertg'])) {
    $id_usertg = htmlspecialchars($data['id_usertg']);
    getUserSteps($id_usertg);
} else {
    echo json_encode(['success' => false, 'message' => 'No id_usertg provided']);
}

?>