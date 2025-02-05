<?php
// Получить значение заголовка Origin
$origin = $_SERVER['HTTP_ORIGIN'];

// Установить разрешенный домен в зависимости от значения заголовка Origin

    $allowed_origin = "https://inhomeka.online";


header("Access-Control-Allow-Origin: $allowed_origin"); // Разрешить запросы с фронтенд сервера
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Разрешить методы запроса
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Разрешить заголовки
header('Access-Control-Allow-Credentials: true'); // Разрешить куки

// Если это preflight запрос, вернуть 200 OK и завершить выполнение скрипта
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    header("Content-Length: 0");
    header("Content-Type: text/plain");
    exit;
}
?>