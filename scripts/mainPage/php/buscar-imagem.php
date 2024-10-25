<?php
// Conexão com o banco de dados
include_once(__DIR__ . '/../../bancoDeDados/config.php');

// Receber o código do produto
$codigoProduto = $_GET['codigo'];

// Consulta para buscar o caminho da imagem
$sql = "SELECT caminho_imagem FROM produtos WHERE codigo = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $codigoProduto);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $caminhoImagem = $row['caminho_imagem'];
    
    // Retornar o caminho da imagem em formato JSON
    echo json_encode(['sucesso' => true, 'caminhoImagem' => $caminhoImagem]);
} else {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Produto não encontrado']);
}

$stmt->close();
$conn->close();
?>
