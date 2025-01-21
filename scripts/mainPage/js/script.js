document.getElementById('adicionar-produto').addEventListener('click', function () {
    // Cria um novo contêiner para o campo de código do produto e diluição
    let div = document.createElement('div');
    div.classList.add('produto-item');
    div.innerHTML = `
        <input type="text" class="codigo-produto" placeholder="Código do Produto">
        <div class="dilution-container">
            <img src="" alt="Imagem do Produto" class="imagem-produto hidden">
            <textarea class="dilution-input hidden" placeholder="" maxlength="3"></textarea>
            <textarea class="finalidade-input hidden" placeholder="Digite a finalidade" maxlength="60"></textarea>
            <textarea class="ident-input hidden" placeholder="ID" maxlength="2"></textarea>
        </div>
    `;
    document.getElementById('produto-container').appendChild(div);

    // Ação quando o código do produto for inserido
    div.querySelector('.codigo-produto').addEventListener('input', function () {
        let codigoProduto = this.value;

        // Verifica se o código contém letras
        const contemLetras = /[a-zA-Z]/.test(codigoProduto);

        // Referência aos elementos da tela
        const img = div.querySelector('.imagem-produto');
        const dilucaoInput = div.querySelector('.dilution-input');
        const finalidadeInput = div.querySelector('.finalidade-input');
        const identInput = div.querySelector('.ident-input');

        if (contemLetras) {
            // Esconde o campo de finalidade
            finalidadeInput.classList.add('hidden');
        } else {
            // Mostra os campos se não houver letras
            finalidadeInput.classList.remove('hidden');
        }

        // Fazer uma chamada Ajax para buscar o caminho da imagem no banco de dados
        fetch('/scripts/mainPage/php/buscar-imagem.php?codigo=' + codigoProduto)
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    // Mostrar a imagem na tela
                    img.src = data.caminhoImagem;
                    img.classList.remove('hidden');

                    // Mostrar outros campos se o código não contém letras
                    if (!contemLetras) {
                        dilucaoInput.classList.remove('hidden');
                        identInput.classList.remove('hidden');
                    }

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

    const tecnico = document.getElementById('consultor-tecnico').value;
    let backgroundPath;

    // Define o caminho do background com base no técnico selecionado
    switch (tecnico) {
        case 'Cezar Petry':
            backgroundPath = '/assets/vendedores/01 - Cezar Petry.png';
            break;
        case 'Sérgio Marciano':
            backgroundPath = '/assets/vendedores/02 - Sérgio Marciano.png';
            break;
        case 'Rodrigo Pelegrino':
            backgroundPath = '/assets/vendedores/03 - Rodrigo Pelegrino.png';
            break;
        case 'Edimar Luchtemberg':
            backgroundPath = '/assets/vendedores/04 - Edimar Luchtemberg.png';
            break;
        case 'Dionisio Ferreira':
            backgroundPath = '/assets/vendedores/05 - Dionízio Ferreira.png';
            break;
        case 'José Neto - FOZ':
            backgroundPath = '/assets/vendedores/06 - José Neto - FOZ.png';
            break;
        case 'Cristian':
            backgroundPath = '/assets/vendedores/07 - Cristian.png';
            break;
        case 'José Neto':
            backgroundPath = '/assets/vendedores/08 - José Neto.png';
            break;
        case 'Sergio Deodato':
            backgroundPath = '/assets/vendedores/09 - Sergio Deodato.png';
            break;
        case 'Eduardo Souza':
            backgroundPath = '/assets/vendedores/10 - Eduardo Souza.png';
            break;
        case 'Elton Rohling':
            backgroundPath = '/assets/vendedores/11 - Elton Rohling.png';
            break;
        case 'Josiel Soares':
            backgroundPath = '/assets/vendedores/12 - Josiel soares.png';
            break;
        default:
            // Se nenhum técnico for selecionado, usa o modelo padrão
            backgroundPath = '/assets/vendedores/modelo_background.png';
    }

    // Carregue o background escolhido
    const backgroundImageBytes = await loadImageBytes(backgroundPath);
    const pdfDoc = await PDFDocument.create();
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


            const empresa = document.getElementById('empresa').value
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


            const maxTextWidthDiluicao = pageWidth - 1770;
            const diluicaoText = `${produtoData.diluicao}`;
            const diluicaoLines = wrapText(diluicaoText, maxTextWidthDiluicao, textFontSize);
            
            let diluicaoLineYOffset = textYOffset - 15;
            
            // Ajuste dinâmico da posição X com base no comprimento do texto
            let diluicaoXOffset;
            if (diluicaoText.length == 2) {
                diluicaoXOffset = 1065; // Mais centralizado para números pequenos
            } else if (diluicaoText.length == 3) {
                diluicaoXOffset = 1054; // Posição padrão para 3 dígitos
            } else if (diluicaoText.length == 1) {
                diluicaoXOffset = 1075;
            }             
            else {
                diluicaoXOffset = 1045; // Para textos maiores, ajusta para a esquerda
            }
            
            // Ajuste o espaçamento entre linhas dinamicamente, se necessário
            let lineSpacing = diluicaoText.length <= 3 ? 30 : 25; // Ajusta o espaçamento se o texto for curto ou longo
            
            for (const line of diluicaoLines) {
                currentPage.drawText(line, {
                    x: diluicaoXOffset,
                    y: diluicaoLineYOffset + 205,
                    size: textFontSize,
                    color: rgb(0, 0, 0),
                });
                diluicaoLineYOffset -= lineSpacing; // Ajusta para a próxima linha
            }

            // Quebra o texto da finalidade em várias linhas
            const finalidadeLines = wrapText(`${produtoData.finalidade}`, textFontSize);
            let finalidadeLineYOffset = textYOffset - 60; // Ajuste a posição inicial se necessário

            for (const line of finalidadeLines) {
                currentPage.drawText(line, { x: 1500, y: finalidadeLineYOffset + 520, size: textFontSize + 4, color: rgb(1, 1, 1) });
                finalidadeLineYOffset -= 80; // Ajusta para a próxima linha
            }

            // Quebra o texto do ident em várias linhas
            const maxTextWidthIdent = pageWidth - 1770;
            const identLines = wrapText(`${produtoData.ident}`, maxTextWidthIdent, textFontSize);
            let identLineYOffset = textYOffset - 105; // Ajuste a posição inicial se necessário

            for (const line of identLines) {
                currentPage.drawText(line, { x: 90, y: identLineYOffset + 325, size: textFontSize + 12, color: rgb(1, 1, 1) });
                identLineYOffset -= 30; // Ajusta para a próxima linha
            }

            currentPage.drawText(`${empresa}`, { x: 50, y: 10, size: 42, color: rgb(0, 0, 0) });

            currentImage++;
        }
    }

    const cliente = document.getElementById('empresa').value
    const vendedor = document.getElementById('consultor-tecnico').value
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${cliente} (${vendedor}).pdf`; 
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
