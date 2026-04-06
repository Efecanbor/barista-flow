<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = 'localhost';
$db   = 'barista_flow';
$user = 'root';
$pass = ''; 
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     
     // Senin tablo yapındaki sütunlara göre çekiyoruz
     // updated_at'e göre en yeni güncellenenleri başa alalım
     $stmt = $pdo->query("SELECT id, product_name, category, stock_quantity, min_stock_level, unit, image_url, updated_at FROM products ORDER BY updated_at DESC");
     $stocks = $stmt->fetchAll();

     echo json_encode([
         "status" => "success",
         "count" => count($stocks),
         "data" => $stocks
     ]);

} catch (\PDOException $e) {
     echo json_encode([
         "status" => "error",
         "message" => "Bağlantı hatası: " . $e->getMessage()
     ]);
}
?>