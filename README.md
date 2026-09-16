# Kanjis Garden 🌸

Aplicação web estática para treinar as leituras dos kanjis apresentados nos cursos **New Progressive 1 e 2**.

O projeto nasceu como uma ferramenta pessoal de estudo e foi reorganizado para deixar a interface, a lógica do jogo e a base de kanjis independentes e fáceis de manter.

## Funcionalidades

- 100 kanjis do New Progressive 1 e 2.
- 39 kanjis iniciais selecionados por padrão.
- Seleção por livro e capítulo.
- Respostas em **hiragana, katakana ou romaji**.
- Sessões de 10, 20, 30, completa e infinita.
- Sessões curtas priorizam fortemente os kanjis aprendidos mais recentemente.
- Sem repetição dentro de uma sessão/ciclo.
- Botão **“Não sei”** revela a resposta, mas ainda exige que o aluno digite uma leitura válida.
- Após o acerto, exibe cada leitura em uma lista com kana/katakana, romaji e contexto de uso.
- Leituras com usos diferentes podem trazer exemplos individuais.
- `Enter` confirma a resposta e, após o acerto, avança para o próximo kanji.
- Estatísticas e seleção persistidas no `localStorage`.
- Interface mobile-first com tema claro/escuro.

## Estrutura

```text
kanjis-garden/
├── index.html
├── css/
│   └── styles.css
├── data/
│   ├── kanjis.js
│   └── reading-details.js
├── js/
│   ├── storage.js
│   ├── game.js
│   └── app.js
└── README.md
```

### `data/kanjis.js`

Fonte de dados do currículo. Cada entrada informa livro, capítulo, ordem, leituras aceitas, forma de exibição e significados.

### `data/reading-details.js`

Complementos por pronúncia: contexto de uso e exemplos para leituras que precisam de distinção adicional. Quando não existe um detalhe específico, a interface identifica automaticamente kun'yomi/on'yomi e mostra o significado do kanji.

### `js/game.js`

Regras independentes da interface: normalização de kana/romaji, validação de respostas, romanização para exibição e sorteio com peso por recência.

### `js/storage.js`

Persistência local da seleção, estatísticas e tema.

### `js/app.js`

Renderização das telas e fluxo das sessões.

## Executar localmente

Não há build nem dependências. Basta abrir `index.html` em um navegador moderno.

Também é possível servir a pasta com qualquer servidor HTTP estático.

## Base curricular

A ordem e as leituras foram transcritas da lista de kanjis do **New Progressive 1–2**. Leituras novas de kanjis já apresentados são consolidadas na mesma entrada para evitar duplicação.

## Observação

Este repositório contém somente a implementação do Kanjis Garden. O material didático usado como referência não é redistribuído aqui.
