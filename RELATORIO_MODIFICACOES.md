# Relatório de modificações — Projeto "Mario Jump"

📌 **Propósito:** Este documento descreve as alterações feitas no código do projeto para você entregar ao professor. Está em português e inclui o que foi modificado, por quê, como testar e observações.

---

## Resumo executivo ✅
As modificações adicionaram/ajustaram a estrutura, estilos e a lógica do jogo "Mario Jump" para fornecer:
- Um cenário jogável com personagem (Mario), obstáculos (canos), animações e pontuação.
- Geração dinâmica de obstáculos com aumento gradativo de dificuldade.
- Detecção de colisão confiável, manipulação de eventos (teclado, clique/touch), sistema de reinício e suporte a sons (se presentes).

Essas mudanças tornam o projeto funcional como um jogo simples (endless runner) e incluem documentação inline nos arquivos.

---

## Arquivos modificados / principais com mudanças 🔧
- `index.html` — estrutura do HTML e marcação dos elementos do jogo.
- `css/style.css` — estilos, posicionamento e animações (pipes, nuvens, pulo do Mario).
- `js/script.js` — lógica do jogo: pulo, spawn de canos, loop principal, detecção de colisão, pontuação e reinício.

> Observação: Não há histórico de commits no repositório acessível aqui; o relatório descreve o estado atual dos arquivos e as funcionalidades implementadas.

---

## Detalhes por arquivo 🗂️

### `index.html`
- Adição do container principal `.game-board` que contém:
  - Imagens de fundo (`clouds.png`) e sprite do personagem (`mario.gif`).
  - Container `#pipes-container` com um elemento `.pipe.template` usado como modelo para gerar canos dinamicamente via JS.
  - UI com `div.score` e botão `#restart` para reiniciar o jogo.
- Uso de `<script defer>` para carregar `js/script.js` após o DOM.

### `css/style.css`
- Estilização completa do cenário: `.game-board`, `.mario`, `.pipe`, `.clouds`.
- Implementação de animações com `@keyframes`:
  - `pipe-animation` — movimento horizontal dos canos (direita → esquerda).
  - `jump` — animação do pulo do Mario.
  - `clouds-animation` — movimento lento das nuvens (efeito parallax).
- Responsividade básica com media query para telas pequenas (ajuste de tamanhos).
- Classe `.pipe.template` escondida e `.hidden` para controlar exibição de UI.

### `js/script.js`
- Seleção de elementos DOM no carregamento (Mario, pipes-container, botões e score).
- Sistema de áudio opcional via função `tryCreateAudio` (arquivos em `mario-jump-images/` se existirem).
- Implementação de `jump()`:
  - Adiciona/remova classe `.jump` para disparar animação CSS do pulo.
  - Previne pulo duplo ao verificar presença da classe.
- `gameLoop()` usa `requestAnimationFrame` para checagem contínua de colisão e lógica do jogo.
- Hitboxes reduzidas via `shrinkRect` para detecção de colisão mais justa (evita colisões falsas).
- `createPipe()` clona o template, configura animação e adiciona ao `pipesContainer`.
- `startSpawning()` e `increaseDifficulty()` controlam tempo entre spawns e velocidade dos canos, aumentando a dificuldade conforme a pontuação.
- `updateScore()` e `endGame()` controlam exibição do score, pausa de animações, troca da imagem do Mario e exibição do botão de reinício.
- Eventos registrados:
  - `keydown` (Space / ArrowUp etc.) — para pular.
  - `click` / `touchstart` — suporte para dispositivos móveis/tela touch.
  - `restart` — reinicia o estado do jogo.

---

## Por que as mudanças foram feitas (motivo) 💡
- Transformar a página em um jogo funcional com jogabilidade básica e elementos visuais.
- Separar responsabilidades: HTML para estrutura, CSS para apresentação/animações, JS para a lógica de jogo.
- Melhorar experiência e robustez: spawn dinâmico, detecção de colisão mais justa, aumento de dificuldade progressivo, e reinício amigável.

---

## Como testar / demonstrar para o professor ▶️
1. Abra a pasta do projeto e execute o `index.html` em qualquer navegador moderno (Chrome, Edge, Firefox). Em PowerShell você pode usar:

```powershell
Start-Process .\index.html
```

2. Verifique que os seguintes comportamentos estão funcionando:
   - Mario aparece no chão e pula ao pressionar Espaço / ArrowUp / clicar ou tocar.
   - Cano(s) surgem pela direita e se movem para a esquerda; o jogador ganha pontos ao passar pelos canos.
   - O score é atualizado no canto superior e o botão de "Jogar novamente" aparece após game over.
   - O reinício limpa canos e reseta score para zero.

3. Arquivos de mídia opcionais (se quiser sons/arte final): verifique `mario-jump-images/` para imagens e sons (`jump.wav`, `bg.mp3`, `gameover.wav`) — se estiverem presentes, os sons serão reproduzidos.

---

## Observações / pontos para melhoria ⚠️
- Caso deseje histórico de alterações (diffs por commit), recomendo iniciar um repositório Git e commitar mudanças com mensagens claras.
- A detecção de colisão pode ser ainda mais refinada (testar diferentes porcentagens de shrinkRect para ajustar hitbox).
- Adicionar controle de volume nos sons, e opção de ativar/desativar som.
- Implementar uma tela de menu e salvamento de high-score local (localStorage) para registrar recordes.

---

Se você quiser, eu posso:
- Gerar um arquivo PDF desse relatório pronto para entregar;
- Incluir prints/screenshots com anotações para o professor;
- Preparar um breve README com instruções de execução (passos de 1 página).

Boa sorte na apresentação! Se quiser, ajusto o tom do relatório para algo mais formal ou mais curto para o seu professor.
