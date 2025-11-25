/*
    ========================================
    JOGO MARIO JUMP - LÓGICA JAVASCRIPT
    ========================================
    
    Arquivo de lógica e interatividade do jogo
    
    Conceitos JavaScript abordados:
    - DOM Manipulation (querySelector, classList)
    - Event Listeners (addEventListener)
    - Timers (setTimeout, setInterval, clearInterval)
    - Computed Styles (getComputedStyle)
    - Collision Detection (detecção de colisão)
    - String Manipulation (replace)
    - Conditional Logic (if)
    
    Estrutura do código:
    1. Seleção de elementos DOM
    2. Função de pulo
    3. Loop de verificação de colisão
    4. Event listener para controle do jogador
    
    Prof. Alexsander Barreto - AlexHolanda.com.br
    ========================================
*/

/* 
    ==========================================
    SELEÇÃO DE ELEMENTOS DOM
    ==========================================
    Captura referências dos elementos HTML para manipulação
*/

const mario = document.querySelector(".mario");
const pipesContainer = document.getElementById('pipes-container');
let pipeTemplate = null;
if (pipesContainer) {
    pipeTemplate = pipesContainer.querySelector('.pipe.template');
}

if (!pipesContainer) console.warn('pipesContainer não encontrado: verifique se #pipes-container existe no HTML');
if (!pipeTemplate) console.warn('pipeTemplate não encontrado: usando fallback para buscar .pipe no documento');
if (!pipeTemplate) pipeTemplate = document.querySelector('.pipe');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');
const gameBoard = document.querySelector('.game-board');

/*
    Seletores principais:
    - `mario`: sprite do jogador
    - `pipesContainer`: container onde os canos serão gerados dinamicamente
    - `pipeTemplate`: imagem usada apenas como template (escondida)
    - `scoreEl`: elemento que mostra o score
    - `restartBtn`: botão de reinício
*/
/* 
    querySelector('.pipe'):
    - Captura referência do elemento cano
    - Usado para obter posição (offsetLeft) e parar animação
    - IMPORTANTE: seletor de classe (.) vs seletor de ID (#)
*/

/* 
    ==========================================
    FUNÇÃO JUMP: CONTROLA O PULO DO MARIO
    ==========================================
    Função executada quando jogador pressiona qualquer tecla
*/
let score = 0;
let gameOver = false;
let pipes = [];
let spawnTimerId = null;
let animationFrameId = null;
let pipeSpeed = 1.5; // segundos (duração da animação)
let spawnInterval = 1600; // ms entre spawns (será reduzido com score)

/* Sons (opcionais) - coloque arquivos em mario-jump-images/ com esses nomes para ativar */
const sounds = {
    jump: tryCreateAudio('./mario-jump-images/jump.wav'),
    bg: tryCreateAudio('./mario-jump-images/bg.mp3'),
    gameover: tryCreateAudio('./mario-jump-images/gameover.wav')
};

function tryCreateAudio(path) {
    try {
        const a = new Audio(path);
        // não acusar erro agora; se arquivo não existir, eventos falharão silenciosamente
        return a;
    } catch (e) {
        return null;
    }
}

const jump = () => {
  /* 
        Arrow Function (ES6+):
        Sintaxe moderna e concisa de declarar funções
        const jump = () => {} equivale a function jump() {}
        Vantagens: sintaxe limpa, não cria próprio contexto 'this'
    */

    if (gameOver) return;

    // evita pulo múltiplo enquanto já está pulando
    if (mario.classList.contains('jump')) return;

    mario.classList.add("jump");
    if (sounds.jump) { sounds.jump.currentTime = 0; sounds.jump.play().catch(()=>{}); }
  /* 
        classList.add('jump'):
        - Adiciona a classe CSS "jump" ao elemento Mario
        - Dispara animação CSS definida em style.css
        - .jump { animation: jump 500ms ease-out; }
        - Elemento pode ter múltiplas classes: "mario jump"
        
        IMPORTANTE: Manipulação de classes é preferível a estilos inline
        Mantém separação de responsabilidades (CSS para estilos)
    */

  setTimeout(() => {
    /* 
            setTimeout():
            - Executa função após determinado tempo (em milissegundos)
            - Sintaxe: setTimeout(função, delay)
            - 500ms: mesmo tempo da animação CSS do pulo
            
            Arrow function como callback:
            - () => {} é a função executada após o delay
            - Alternativa: setTimeout(function() {...}, 500)
        */

    mario.classList.remove("jump");
    /* 
            classList.remove('jump'):
            - Remove a classe "jump" após 500ms
            - Finaliza a animação CSS
            - Permite que Mario pule novamente (classe pode ser re-adicionada)
            
            LÓGICA: 
            1. Tecla pressionada → add('jump') → animação inicia
            2. Após 500ms → remove('jump') → pronto para novo pulo
            
            SEM ISSO: Mario não poderia pular múltiplas vezes
        */
  }, 500);
  /* 
        Delay de 500ms:
        - Sincronizado com duração da animação CSS (500ms)
        - Garante que animação complete antes de remover classe
        - Se fosse menor: animação cortada
        - Se fosse maior: delay desnecessário entre pulos
    */
};

/* 
    ==========================================
    LOOP DE DETECÇÃO DE COLISÃO
    ==========================================
    setInterval: Executa função repetidamente em intervalos regulares
*/
/*
        Loop principal do jogo (requestAnimationFrame)
        - checa colisões com todos os canos ativos
        - atualiza score quando cano é ultrapassado
*/
function gameLoop() {
    if (gameOver) return;

    const marioRect = mario.getBoundingClientRect();
    // reduz a hitbox do Mario para colisões mais justas
    const marioBox = shrinkRect(marioRect, 0.28);

    for (let i = pipes.length - 1; i >= 0; i--) {
        const p = pipes[i];
        const rect = p.getBoundingClientRect();

        // removendo canos já fora da tela
        if (rect.right < 0) {
            p.remove();
            pipes.splice(i, 1);
            continue;
        }

        // conferir se passou do Mario para contar ponto
        if (p.dataset.counted !== 'true' && rect.right < marioRect.left) {
            p.dataset.counted = 'true';
            score += 1;
            updateScore();
            increaseDifficulty();
            console.log('pontuou! score atual =', score, 'canos ativos =', pipes.length);
        }

        // colisão: compara hitboxes reduzidas
        const pipeBox = shrinkRect(rect, 0.22);
        if (intersects(marioBox, pipeBox)) {
            return endGame();
        }
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// inicia o loop
animationFrameId = requestAnimationFrame(gameLoop);

/* Helpers: reduzir retângulo (hitbox) e checar interseção */
function shrinkRect(r, pct) {
    const width = r.width || (r.right - r.left);
    const height = r.height || (r.bottom - r.top);
    const newW = width * (1 - pct);
    const newH = height * (1 - pct);
    const left = r.left + (width - newW) / 2;
    const top = r.top + (height - newH) / 2;
    return { left, right: left + newW, top, bottom: top + newH, width: newW, height: newH };
}

function intersects(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

/* spawn dinâmico de canos */
function createPipe() {
    if (gameOver) return;
    if (!pipeTemplate) return;

    console.log('createPipe() chamado');
    const p = pipeTemplate.cloneNode(true);
    p.classList.remove('template');
    p.style.display = p.tagName === 'IMG' ? 'block' : '';
    p.style.setProperty('--pipe-duration', `${pipeSpeed}s`);
    p.style.animationDuration = `${pipeSpeed}s`;
    // garante que a animação esteja definida (caso template fosse um elemento sem animação)
    p.style.animationName = p.style.animationName || 'pipe-animation';
    p.dataset.counted = 'false';

    // às vezes gerar cano "voador" para variar (20% de chance)
    if (Math.random() < 0.2) {
        p.style.bottom = `${Math.random() * 150 + 40}px`;
    } else {
        p.style.bottom = '0px';
    }

    pipesContainer.appendChild(p);
    pipes.push(p);
    console.log('cano gerado e adicionado; pipes length =', pipes.length);

    // cleanup: remover cano após tempo máximo (fallback)
    setTimeout(() => {
        if (p && p.parentNode) p.remove();
    }, (pipeSpeed + 2) * 1000);
}

/* inicia spawn periódico */
function startSpawning() {
    clearInterval(spawnTimerId);
    spawnTimerId = setInterval(createPipe, spawnInterval);
    createPipe();
}

/* atualiza score no DOM */
function updateScore() {
    if (scoreEl) scoreEl.textContent = String(score);
}

/* aumenta dificuldade conforme score */
function increaseDifficulty() {
    const level = Math.floor(score / 5);
    pipeSpeed = Math.max(0.8, 1.5 - level * 0.08);
    spawnInterval = Math.max(800, 1600 - level * 80);
    if (spawnTimerId) {
        clearInterval(spawnTimerId);
        spawnTimerId = setInterval(createPipe, spawnInterval);
    }
}

/* encerra o jogo */
function endGame() {
    gameOver = true;
    mario.style.animationPlayState = 'paused';
    mario.classList.remove('jump');
    mario.src = './mario-jump-images/game-over.png';
    mario.style.width = '75px';
    mario.style.marginLeft = '50px';

    pipes.forEach(p => { p.style.animationPlayState = 'paused'; });

    clearInterval(spawnTimerId);
    spawnTimerId = null;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    if (sounds.gameover) { sounds.gameover.currentTime = 0; sounds.gameover.play().catch(()=>{}); }

    if (restartBtn) restartBtn.classList.remove('hidden');
}

/* reinicia o jogo */
function restartGame() {
    mario.src = './mario-jump-images/mario.gif';
    mario.style.width = '';
    mario.style.marginLeft = '';
    mario.style.animationPlayState = '';

    pipes.forEach(p => p.remove());
    pipes = [];

    score = 0;
    updateScore();
    gameOver = false;
    pipeSpeed = 1.5;
    spawnInterval = 1600;

    if (restartBtn) restartBtn.classList.add('hidden');

    animationFrameId = requestAnimationFrame(gameLoop);
    startSpawning();
    if (sounds.bg) { sounds.bg.loop = true; sounds.bg.play().catch(()=>{}); }
}

/* inicia o sistema de spawn ao carregar */
startSpawning();
if (sounds.bg) { sounds.bg.loop = true; sounds.bg.play().catch(()=>{}); }

/* Interações: tecla específica (Space / ArrowUp) e touch/click */
document.addEventListener('keydown', (event) => {
    const code = event.code || event.key;
    if (code === 'Space' || code === 'ArrowUp' || code === 'Spacebar' || code === ' ') {
        event.preventDefault();
        jump();
    }
});

gameBoard.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });
gameBoard.addEventListener('click', (e) => { jump(); });

if (restartBtn) restartBtn.addEventListener('click', restartGame);
/* 
    Intervalo de 10 milissegundos:
    - Verifica colisão 100 vezes por segundo (1000ms / 10ms)
    - Detecção muito precisa e responsiva
    - Menor intervalo = mais preciso, mas mais processamento
    - Maior intervalo = menos preciso, pode "perder" colisões
    
    10ms É IDEAL:
    - Precisão suficiente para jogo fluido
    - Performance aceitável (não sobrecarrega navegador)
    - Taxa de atualização > 60 FPS típico
*/

/* 
    ==========================================
    EVENT LISTENER: CONTROLE DO JOGADOR
    ==========================================
    Detecta quando jogador pressiona tecla
*/
// O controle por tecla é registrado acima (teclas específicas Space / ArrowUp)
/* 
    addEventListener('keydown', função):
    - Registra "ouvinte" de evento no documento
    - 'keydown': evento disparado quando QUALQUER tecla é pressionada
    - jump: função executada quando evento ocorre
    
    IMPORTANTE NOTAR:
    - Sem parênteses: jump (não jump())
    - Passa referência da função, não executa imediatamente
    - jump() executaria na hora, queremos executar só ao pressionar tecla
    
    QUALQUER TECLA faz Mario pular:
    - Espaço, Enter, setas, letras, números...
    - Facilita jogabilidade (não requer tecla específica)
    
    ALTERNATIVAS MAIS ESPECÍFICAS:
    - Detectar tecla específica: event.key === 'Space'
    - Múltiplos eventos: 'keydown', 'click', 'touchstart'
    
    EXEMPLO REFINADO:
    document.addEventListener('keydown', (event) => {
        if (event.key === ' ' || event.key === 'ArrowUp') {
            jump();
        }
    });
*/

/*
    ========================================
    RESUMO DO FLUXO DE EXECUÇÃO
    ========================================
    
    1. CARREGAMENTO:
       - HTML carrega → script.js executa (defer)
       - Seleciona elementos DOM (mario, pipe)
       - Inicia loop de verificação (setInterval)
       - Registra listener de teclado (addEventListener)
    
    2. DURANTE O JOGO:
       - Loop verifica posições a cada 10ms
       - Jogador pressiona tecla → jump() executa
       - jump() adiciona classe → CSS anima
       - Após 500ms → classe removida → pronto para novo pulo
    
    3. DETECÇÃO DE COLISÃO:
       - A cada 10ms: verifica if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80)
       - Se TRUE: colisão detectada!
    
    4. GAME OVER:
       - Para animações (pipe e mario)
       - Fixa posições atuais
       - Troca imagem do Mario
       - Para loop de verificação
       - Jogo congela (sem reinício automático)
    
    ========================================
    CONCEITOS DE PROGRAMAÇÃO APLICADOS
    ========================================
    
    1. EVENT-DRIVEN PROGRAMMING:
       - Programa responde a eventos (tecla pressionada)
       - addEventListener registra callbacks
    
    2. GAME LOOP:
       - setInterval cria loop contínuo
       - Verifica estado do jogo repetidamente
       - Padrão fundamental em desenvolvimento de jogos
    
    3. COLLISION DETECTION:
       - Verifica sobreposição de elementos
       - Usa posições e dimensões (bounding boxes)
       - Lógica booleana composta (AND)
    
    4. STATE MANAGEMENT:
       - Classes CSS representam estados (jump/normal)
       - Imagens diferentes para estados (running/game-over)
       - Animações ativas/pausadas
    
    5. TIMERS E ASSINCRONICIDADE:
       - setTimeout: ação futura única
       - setInterval: ação repetida
       - clearInterval: cancelamento de timer
    
    ========================================
    POSSÍVEIS MELHORIAS (EXERCÍCIOS)
    ========================================
    
    1. Sistema de pontuação:
       - Contador de canos ultrapassados
       - Exibir score em tempo real
    
    2. Dificuldade progressiva:
       - Aumentar velocidade do cano gradualmente
       - Reduzir intervalo entre canos
    
    3. Sons:
       - Som de pulo
       - Música de fundo
       - Som de game over
    
    4. Reinício do jogo:
       - Botão "Jogar novamente"
       - Resetar posições e animações
    
    5. Tecla específica para pulo:
       - Apenas espaço ou seta para cima
       - Evitar pulos acidentais
    
    6. Múltiplos obstáculos:
       - Vários canos com intervalos variados
       - Obstáculos voadores
    
    7. Detecção de colisão mais precisa:
       - Usar hitboxes (áreas de colisão menores)
       - Física mais realista
    
    8. Responsividade:
       - Adaptar para mobile (touch events)
       - Media queries para diferentes telas
    
    ========================================
    Prof. Alexsander Barreto - AlexHolanda.com.br
    ========================================
*/
