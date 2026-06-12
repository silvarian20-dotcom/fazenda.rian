// Estado lógico do Jogo
let gameState = {
    coins: 100,
    sustainability: 50,
    water: 100,
    energy: 0,
    upgrades: { solar: 0, cisterna: 0, compost: 0 },
    plots: Array(9).fill(null).map(() => ({ state: 'empty', progress: 0, crop: null }))
};

// Configurações dos tipos de cultivos
const cropTypes = {
    alface: { name: 'Alface', icon: '🥬', time: 5, cost: 10, reward: 25, waterCost: 15, sustBonus: 2 }
};

// Função para atualizar os elementos da Interface (HTML) com base nas variáveis do JS
function updateUI() {
    document.getElementById('coins').innerText = gameState.coins;
    document.getElementById('sust').innerText = gameState.sustainability + '%';
    document.getElementById('water').innerText = Math.floor(gameState.water) + '%';
    document.getElementById('energy').innerText = gameState.energy + ' kW';

    // Gerencia a ativação/desativação dos botões da loja
    document.getElementById('btn-solar').disabled = gameState.coins < 50;
    document.getElementById('btn-cisterna').disabled = gameState.coins < 80;
    document.getElementById('btn-compost').disabled = gameState.coins < 100;

    // Renderiza o status visual de cada lote de terra
    gameState.plots.forEach((plot, index) => {
        const plotEl = document.getElementById(`plot-${index}`);
        const textEl = plotEl.querySelector('.status-text');
        
        if (plot.state === 'empty') {
            plotEl.firstChild.textContent = '🟫';
            textEl.innerText = 'Plantar (10🪙)';
        } else if (plot.state === 'growing') {
            plotEl.firstChild.textContent = '🌱';
            textEl.innerText = `Crescendo...`;
        } else if (plot.state === 'ready') {
            plotEl.firstChild.textContent = cropTypes.alface.icon;
            textEl.innerText = 'Colher!';
        }
    });
}

// Ação de clicar em um lote de terra
function interactPlot(index) {
    let plot = gameState.plots[index];

    if (plot.state === 'empty') {
        // Tenta plantar
        if (gameState.coins >= cropTypes.alface.cost && gameState.water >= cropTypes.alface.waterCost) {
            gameState.coins -= cropTypes.alface.cost;
            gameState.water -= cropTypes.alface.waterCost;
            plot.state = 'growing';
            plot.crop = 'alface';
            plot.progress = 0;
            showNews("🥬 Alface plantada! Consumiu água e recursos.");
        } else {
            showNews("❌ Recursos insuficientes! Aguarde a reposição de água ou consiga moedas.");
        }
    } else if (plot.state === 'ready') {
        // Realiza a colheita sustentável
        let crop = cropTypes[plot.crop];
        let sustBonus = crop.sustBonus + (gameState.upgrades.compost * 2);
        
        gameState.coins += crop.reward;
        gameState.sustainability = Math.min(100, gameState.sustainability + sustBonus);
        
        plot.state = 'empty';
        plot.crop = null;
        showNews(`💰 Colheita realizada! +${crop.reward} moedas eco e +${sustBonus}% de Sustentabilidade!`);
    }
    updateUI();
}

// Compra de Eco-Upgrades
function buyUpgrade(type, cost) {
    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        gameState.upgrades[type]++;
        
        if (type === 'solar') {
            gameState.energy += 15;
            gameState.sustainability = Math.min(100, gameState.sustainability + 5);
            showNews("☀️ Painel Solar instalado! Gerando energia limpa de forma passiva.");
        } else if (type === 'cisterna') {
            showNews("🌧️ Cisterna construída! Coleta de água da chuva otimizada.");
        } else if (type === 'compost') {
            showNews("🪱 Compostagem ativada! Solo mais rico em matéria orgânica.");
        }
        updateUI();
    }
}

// Atualiza o painel de notícias do jogo
function showNews(text) {
    document.getElementById('news-ticker').innerText = "📢 " + text;
}

// Loop contínuo do Game (Executado de 1 em 1 segundo)
setInterval(() => {
    // 1. Atualiza o cronômetro das plantações em crescimento
    gameState.plots.forEach((plot) => {
        if (plot.state === 'growing') {
            plot.progress += 1;
            if (plot.progress >= cropTypes[plot.crop].time) {
                plot.state = 'ready';
            }
        }
    });

    // 2. Regeneração natural da água (turbinada pelas cisternas compradas)
    let waterRegen = 2 + (gameState.upgrades.cisterna * 3);
    gameState.water = Math.min(100, gameState.water + waterRegen);

    // 3. Créditos financeiros passivos gerados por painéis solares
    if (gameState.upgrades.solar > 0) {
        gameState.coins += gameState.upgrades.solar * 1;
    }

    // 4. Degradação ambiental aleatória (desafio do jogo para exigir manutenção sustentável)
    if (Math.random() < 0.1) {
        gameState.sustainability = Math.max(0, gameState.sustainability - 1);
    }

    updateUI();
}, 1000);

// Inicia a interface na primeira execução
updateUI();