document.getElementById("generate-pdf").addEventListener("click", async function () {
    const { PDFDocument } = PDFLib;

    // Função para carregar uma imagem para bytes
    async function loadImageBytes(path) {
        const response = await fetch(path);
        return response.arrayBuffer();
    }

    // Armazena os caminhos das imagens dos produtos
    let imagePaths = [];

    // Coleta os códigos dos produtos inseridos pelo usuário
    const produtos = document.querySelectorAll('.codigo-produto');
    for (let produto of produtos) {
        const codigoProduto = produto.value;
        const response = await fetch('/scripts/mainPage/php/buscar-imagem.php?codigo=' + codigoProduto);
        const data = await response.json();

        if (data.sucesso) {
            imagePaths.push(data.caminhoImagem);
        } else {
            console.error(`Imagem não encontrada para o código: ${codigoProduto}`);
        }
    }

    if (imagePaths.length === 0) {
        alert("Nenhum produto válido foi inserido.");
        return;
    }

    // Cria um novo documento PDF
    const pdfDoc = await PDFDocument.create();

    // Carrega a imagem de fundo e embute no PDF
    const backgroundImageBytes = await loadImageBytes('/assets/produtos/modelo_background.png');
    const backgroundImage = await pdfDoc.embedPng(backgroundImageBytes);

    // Dimensões e posições na página
    const pageWidth = backgroundImage.width;
    const pageHeight = backgroundImage.height;

    // Posições ajustadas para inserir as imagens
    const positions = [
        { x: 0, y: pageHeight - 1000 },
        { x: 0, y: pageHeight - 1480 },
        { x: 0, y: pageHeight - 1960 },
        { x: 0, y: pageHeight - 2440 },
        { x: 0, y: pageHeight - 2920 }
    ];

    const maxImagesPerPage = 5; // Número máximo de imagens por página

    // Adiciona as imagens dos produtos no PDF
    let currentImage = 0;

    // Função para detectar o formato da imagem com base no caminho
    function detectImageFormat(path) {
        const extension = path.split('.').pop().toLowerCase();
        return extension === 'png' ? 'png' : 'jpeg'; // Por padrão, assumimos JPEG se não for PNG
    }

    for (let pageIndex = 0; pageIndex < Math.ceil(imagePaths.length / maxImagesPerPage); pageIndex++) {
        // Cria uma nova página
        const currentPage = pdfDoc.addPage([pageWidth, pageHeight]);

        // Adiciona o fundo à página
        currentPage.drawImage(backgroundImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight
        });

        // Insere as imagens na página atual
        for (let i = 0; i < maxImagesPerPage; i++) {
            if (currentImage >= imagePaths.length) break;

            // Detecta o formato da imagem (PNG ou JPEG)
            const imageFormat = detectImageFormat(imagePaths[currentImage]);

            // Carrega a imagem e embute no PDF
            const imageBytes = await loadImageBytes(imagePaths[currentImage]);
            let image;
            if (imageFormat === 'png') {
                image = await pdfDoc.embedPng(imageBytes);
            } else {
                image = await pdfDoc.embedJpg(imageBytes);
            }

            const { x, y } = positions[i]; // Usa as novas posições
            const imageWidth = pageWidth; // Ajusta a largura da imagem
            const imageHeight = imageWidth / 5; // Ajusta a altura da imagem

            // Desenha a imagem no PDF
            currentPage.drawImage(image, {
                x: x,
                y: y,
                width: imageWidth,
                height: imageHeight
            });

            currentImage++;
        }
    }

    // Salva o PDF final com as imagens dos produtos inseridos
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "documento_com_imagens.pdf";
    link.click();
    URL.revokeObjectURL(url);
});



document.getElementById('adicionar-produto').addEventListener('click', function() {
    // Cria um novo input para inserir o código do produto
    let div = document.createElement('div');
    div.innerHTML = `
        <input type="text" class="codigo-produto" placeholder="Código do Produto">
        <img src="" alt="Imagem do Produto" class="imagem-produto hidden">
    `;
    document.getElementById('produto-container').appendChild(div);

    // Ação quando o código do produto for inserido
    div.querySelector('.codigo-produto').addEventListener('input', function() {
        let codigoProduto = this.value;

        // Fazer uma chamada Ajax para buscar o caminho da imagem no banco de dados
        fetch('/scripts/mainPage/php/buscar-imagem.php?codigo=' + codigoProduto)
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    // Mostrar a imagem na tela
                    let img = div.querySelector('.imagem-produto');
                    img.src = data.caminhoImagem;
                    img.classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar imagem:', error);
            });
    });
});
