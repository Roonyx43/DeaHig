document.getElementById('adicionar-produto').addEventListener('click', function() {
    // Cria um novo contêiner para o campo de código do produto e diluição
    let div = document.createElement('div');
    div.classList.add('produto-item');
    div.innerHTML = `
        <input type="text" class="codigo-produto" placeholder="Código do Produto">
        <div class="dilution-container">
            <img src="" alt="Imagem do Produto" class="imagem-produto hidden">
            <textarea class="dilution-input hidden" placeholder="Digite a diluição"></textarea>
            <textarea class="finalidade-input hidden" placeholder="Digite a finalidade"></textarea>
            <textarea class="ident-input hidden" placeholder="ID"></textarea>
        </div>
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

                    // Mostrar os campos de diluição, finalidade e ID
                    let dilucaoInput = div.querySelector('.dilution-input');
                    dilucaoInput.classList.remove('hidden');
                    let finalidadeInput = div.querySelector('.finalidade-input');
                    finalidadeInput.classList.remove('hidden');
                    let identInput = div.querySelector('.ident-input');
                    identInput.classList.remove('hidden');

                    // Adiciona o listener de cor aos campos de entrada
                    [dilucaoInput, finalidadeInput, identInput].forEach(input => {
                        input.addEventListener('input', () => {
                            if (input.value.trim() !== '') {
                                input.style.backgroundColor = 'transparent'; // Cor de fundo quando preenchido
                            } else {
                                input.style.backgroundColor = ''; // Volta ao fundo padrão
                            }
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao buscar imagem:', error);
            });
    });
});

// Função para remover o último produto adicionado
document.getElementById('remover-ultimo-produto').addEventListener('click', function() {
    const produtoContainer = document.getElementById('produto-container');
    const ultimoProduto = produtoContainer.lastElementChild;

    if (ultimoProduto) {
        produtoContainer.removeChild(ultimoProduto);
    } else {
        alert("Nenhum produto para remover.");
    }
});


document.getElementById("generate-pdf").addEventListener("click", async function () {
    const { PDFDocument, rgb } = PDFLib;

    // Função para carregar uma imagem para bytes
    async function loadImageBytes(path) {
        const response = await fetch(path);
        return response.arrayBuffer();
    }

    // Carrega a imagem de logo escolhida pelo usuário, se existir
    const logoInput = document.getElementById("user-image");
    let userLogoBytes = null;
    if (logoInput.files.length > 0) {
        userLogoBytes = await logoInput.files[0].arrayBuffer();
    }

    let produtosData = [];

    // Coleta as informações dos produtos
    const produtos = document.querySelectorAll('.produto-item');
    for (let produto of produtos) {
        const codigoProduto = produto.querySelector('.codigo-produto').value;
        const diluicao = produto.querySelector('.dilution-input').value;
        const finalidade = produto.querySelector('.finalidade-input').value;
        const ident = produto.querySelector('.ident-input').value;

        const response = await fetch('/scripts/mainPage/php/buscar-imagem.php?codigo=' + codigoProduto);
        const data = await response.json();

        if (data.sucesso) {
            produtosData.push({
                caminhoImagem: data.caminhoImagem,
                codigoProduto,
                diluicao,
                finalidade,
                ident
            });
        } else {
            console.error(`Imagem não encontrada para o código: ${codigoProduto}`);
        }
    }

    if (produtosData.length === 0) {
        alert("Nenhum produto válido foi inserido.");
        return;
    }

    const pdfDoc = await PDFDocument.create();
    const backgroundImageBytes = await loadImageBytes('/assets/produtos/modelo_background.png');
    const backgroundImage = await pdfDoc.embedPng(backgroundImageBytes);

    const pageWidth = backgroundImage.width;
    const pageHeight = backgroundImage.height;

    const positions = [
        { x: 0, y: pageHeight - 1000 },
        { x: 0, y: pageHeight - 1480 },
        { x: 0, y: pageHeight - 1960 },
        { x: 0, y: pageHeight - 2440 },
        { x: 0, y: pageHeight - 2920 }
    ];
    const maxImagesPerPage = 5;

    let currentImage = 0;

    function detectImageFormat(path) {
        const extension = path.split('.').pop().toLowerCase();
        return extension === 'png' ? 'png' : 'jpeg';
    }

    function wrapText(text, maxWidth, fontSize) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = "";

        for (let word of words) {
            let testLine = currentLine + word + " ";
            if (testLine.length * fontSize > maxWidth) { 
                lines.push(currentLine);
                currentLine = word + " ";
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    for (let pageIndex = 0; pageIndex < Math.ceil(produtosData.length / maxImagesPerPage); pageIndex++) {
        const currentPage = pdfDoc.addPage([pageWidth, pageHeight]);

        currentPage.drawImage(backgroundImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight
        });

        if (pageIndex === 0 && userLogoBytes) {
            const userLogo = await pdfDoc.embedPng(userLogoBytes);
            currentPage.drawImage(userLogo, {
                x: pageWidth - 350,
                y: pageHeight - 350,
                width: 300,
                height: 300
            });
        }

        for (let i = 0; i < maxImagesPerPage; i++) {
            if (currentImage >= produtosData.length) break;


            const tecnico = document.getElementById('consultor-tecnico').value
            const produtoData = produtosData[currentImage];
            const imageFormat = detectImageFormat(produtoData.caminhoImagem);
            const imageBytes = await loadImageBytes(produtoData.caminhoImagem);
            let image;
            if (imageFormat === 'png') {
                image = await pdfDoc.embedPng(imageBytes);
            } else {
                image = await pdfDoc.embedJpg(imageBytes);
            }

            const { x, y } = positions[i];
            const imageWidth = pageWidth;
            const imageHeight = imageWidth / 5;

            currentPage.drawImage(image, {
                x: x,
                y: y,
                width: imageWidth,
                height: imageHeight
            });

            const textFontSize = 36;
            const textYOffset = y - 20;


            // Quebra o texto da diluição em várias linhas
            const maxTextWidth = pageWidth - 1770;
            const diluicaoLines = wrapText(`${produtoData.diluicao}`, maxTextWidth, textFontSize);
            let lineYOffset = textYOffset - 15;
            for (const line of diluicaoLines) {
                currentPage.drawText(line, { x: 965, y: lineYOffset + 300, size: textFontSize, color: rgb(0, 0, 0) });
                lineYOffset -= 30; // Ajusta para a próxima linha
            }

            currentPage.drawText(`${produtoData.finalidade}`, { x: 1400, y: 2945, size: textFontSize, color: rgb(1, 1, 1) });
            currentPage.drawText(`${produtoData.ident}`, { x: 90, y: 2710, size: textFontSize, color: rgb(1, 1, 1) });
            currentPage.drawText(`Consultor Técnico: ${tecnico}`, { x: 1500, y: 100, size: 56, color: rgb(1, 1, 1) });

            currentImage++;
        }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "documento_com_imagens.pdf";
    link.click();
    URL.revokeObjectURL(url);
});


// Seleciona a div de visualização e o input de arquivo
const preview = document.getElementById("image-preview");
const fileInput = document.getElementById("user-image");

// Abre o seletor de arquivo ao clicar na div de visualização
preview.addEventListener("click", function() {
    fileInput.click();
});

// Atualiza a visualização da imagem selecionada
fileInput.addEventListener("change", function(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            // Limpa o conteúdo e exibe a imagem selecionada
            preview.innerHTML = `<img src="${e.target.result}" alt="Imagem do usuário">`;
        };

        reader.readAsDataURL(file);
    }
});
