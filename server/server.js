const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Configuração do CORS
app.use(cors({
  origin: "http://localhost:5173"
}));

// Permitir receber JSON
app.use(express.json());

const cards = [
  { name: "Dragão de Cobalto", type: "Criatura", attack: 7, defense: 5 },
  { name: "Guardiã das Marés", type: "Criatura", attack: 4, defense: 8 },
  { name: "Rito de Ferro", type: "Feitiço", attack: 0, defense: 0 },
  { name: "Sentinela de Âmbar", type: "Criatura", attack: 6, defense: 6 },
  { name: "Eco do Vazio", type: "Feitiço", attack: 0, defense: 0 },
];

function page(title, body) {
  return `<!DOCTYPE html>
<html lang="pt">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
  </head>
  <body>
    <nav>
      <a href="/">Início</a> ·
      <a href="/cartas">Cartas</a> ·
      <a href="/sobre">Sobre</a> ·
      <a href="/agora">Agora</a>
    </nav>
    <h1>${title}</h1>
    ${body}
  </body>
</html>`;
}

// Página inicial
app.get("/", (req, res) => {
  res.send(page(
    "A minha coleção",
    `<p>Neste momento tenho <b>${cards.length}</b> cartas na coleção.</p>`
  ));
});

// Página sobre
app.get("/sobre", (req, res) => {
  res.send(page(
    "Sobre",
    `<p>Feito por <b>&lt;Murillo Silva&gt;</b>, turma &lt;TGPSI24T&gt;.</p>`
  ));
});

// Página de cartas
app.get("/cartas", (req, res) => {
  const items = cards
    .map((card) => `<li><b>${card.name}</b> — ${card.type}, ataque ${card.attack}</li>`)
    .join("");

  res.send(page("Cartas", `<ul>${items}</ul>`));
});

// Carta aleatória em HTML
app.get("/cartas/aleatoria", (req, res) => {
  const card = cards[Math.floor(Math.random() * cards.length)];

  res.send(page(
    "Carta à sorte",
    `<h2>${card.name}</h2>
     <p>${card.type} · ataque ${card.attack} · defesa ${card.defense}</p>`
  ));
});

// Página com a hora atual
app.get("/agora", (req, res) => {
  const now = new Date().toLocaleString("pt-PT", {
    dateStyle: "long",
    timeStyle: "medium",
  });

  res.send(page("Agora", `<p>Este pedido foi respondido às <b>${now}</b>.</p>`));
});

// GET - Todas as cartas ou filtradas por tipo
app.get("/api/cartas", (req, res) => {
  const tipo = req.query.tipo;

  const resultado = tipo
    ? cards.filter((card) => card.type === tipo)
    : cards;

  res.json(resultado);
});

// GET - Carta aleatória em JSON
app.get("/api/cartas/aleatoria", (req, res) => {
  const card = cards[Math.floor(Math.random() * cards.length)];

  res.json(card);
});

// POST - Adicionar uma carta
app.post("/api/cartas", (req, res) => {
  const card = req.body;

  cards.push(card);

  res.status(201).json(card);
});

// Página 404
app.use((req, res) => {
  res.status(404).send(page(
    "404 — não encontrado",
    `<p>Não existe nada em <code>${req.url}</code>.</p>
     <p><a href="/">Voltar ao início</a></p>`
  ));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server a correr em http://localhost:${PORT}`);
});  