<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D&A Hig</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <link rel="stylesheet" href="/styles/mainPage/style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
</head>
<body>
    <header>
        <img src="/assets/others/logo.jpg" alt="Logo" id="logo">
    </header>

    <main>
        <div class="container">
            <h1>Plano de Higiene</h1>

            

            <!-- Campo para upload de imagem com visualização -->
            <div class="image-upload">
                <label for="user-image"></label>
                <input type="file" id="user-image" accept="image/*" style="display:none;">
                <div class="image-preview" id="image-preview">
                    <p>Selecione a logo do cliente</p>
                </div>
            </div>


            <!-- Exemplo de uma imagem no HTML -->
            <img id="image-to-pdf" src="/assets/produtos/backgroundPDF.jpg" alt="Imagem para PDF" style="display:none;">

            <div id="produto-container">
                <!-- Aqui os produtos e imagens serão adicionados dinamicamente -->
            </div>


            <div class="buttons">
                <button id="adicionar-produto">+</button>
                <button id="remover-ultimo-produto">-</button>
            </div>

            <hr>

            <!-- Botão para gerar PDF -->
            <button id="generate-pdf">Gerar PDF</button>
        </div>
    </main>

    <script src="/scripts/mainPage/js/script.js"></script>
</body>
</html>