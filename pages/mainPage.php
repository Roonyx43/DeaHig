<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D&A Hig</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <link rel="stylesheet" href="/styles/mainPage/style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
    <link rel="shortcut icon" href="/assets/others/logo.ico" type="image/x-icon">
</head>
<body>
    <header>
        <img src="/assets/others/logo.jpg" alt="Logo" id="logo">
    </header>

    <main>
        <div class="container">
            <h1>Plano de Higiene</h1>

            <div class="consultor">
                <label for="empresa">Cliente:</label>
                <input type="text" class="empresa" id="empresa">
            </div>

            <div class="consultor">
                <label for="consultor-tecnico">Consultor Técnico:</label>
                <select id="consultor-tecnico">
                    <option value=""></option>
                    <option value="Eduardo Souza">Eduardo</option>
                    <option value="Elton Rohling">Elton</option>
                    <option value="Sergio Deodato">Deodato</option>
                    <option value="Cristian">Cristian</option>
                    <option value="Dionisio Ferreira">Dionisio</option>
                    <option value="Edimar Luchtemberg">Edimar</option>
                    <option value="Rodrigo Pelegrino">Rodrigo</option>
                    <option value="Sérgio Marciano">Sérgio</option>
                    <option value="Cezar Petry">Cezar</option>
                    <option value="José Neto">Neto - CWB</option>
                    <option value="José Neto - FOZ">Neto - Foz</option>
                    <option value="Josiel Soares">Josiel Soares</option>
                </select>
            </div>

            <!-- Campo para upload de imagem com visualização -->
            <div class="image-upload">
                <label for="user-image"></label>
                <input type="file" id="user-image" accept="image/*" style="display:none;">
                <div class="image-preview" id="image-preview">
                    <p>Selecione a logo do cliente</p>
                </div>
                <span class="tooltip">ATENÇÃO! Somente arquivos PNG</span>
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
            <button type="submit" id="generate-pdf">Gerar PDF</button>
        </div>
    </main>

    <script src="/scripts/mainPage/js/script.js" type="module"></script>
</body>
</html>