const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// CORS
app.use(cors({
    origin: "http://localhost:5173"
}));

// Permite receber JSON
app.use(express.json());

// Ficheiro onde as cartas ficam guardadas
const FILE = path.join(__dirname, "cartas.json");

// Ler as cartas do ficheiro quando o servidor inicia
let cards = JSON.parse(fs.readFileSync(FILE, "utf8"));

// Função para criar páginas HTML
function page(title, body) {
    return `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 40px;
                background-color: #f4f4f4;
            }

            nav {
                margin-bottom: 20px;
            }

            nav a {
                margin-right: 15px;
                text-decoration: none;
                color: blue;
            }

            h1 {
                color: #333;
            }

            .card {
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
            }
        </style>
    </head>
    <body>

        <nav>
            <a href="/">Início</a>
            <a href="/cartas">Cartas</a>
            <a href="/sobre">Sobre</a>
            <a href="/agora">Agora</a>
        </nav>

        ${body}

    </body>
    </html>
    `;
}

// Página inicial
app.get("/", (req, res) => {
    res.send(page(
        "Início",
        `
        <h1>Bem-vindo à aplicação de cartas!</h1>
        <p>Existem atualmente ${cards.length} cartas.</p>
        <p>Consulta as cartas disponíveis na aplicação.</p>
        `
    ));
});

// Página sobre
app.get("/sobre", (req, res) => {
    res.send(page(
        "Sobre",
        `
        <h1>Sobre</h1>
        <p>Esta aplicação permite consultar cartas.</p>
        <p>Foi desenvolvida utilizando Node.js e Express.</p>
        `
    ));
});

// Página com todas as cartas
app.get("/cartas", (req, res) => {

    const lista = cards.map(card => `
        <div class="card">
            <h2>${card.name}</h2>
            <p>Tipo: ${card.type}</p>
            <p>Ataque: ${card.attack}</p>
            <p>Defesa: ${card.defense ?? "Não definida"}</p>
        </div>
    `).join("");

    res.send(page(
        "Cartas",
        `
        <h1>Lista de cartas</h1>
        ${lista}
        `
    ));
});

// Página com uma carta aleatória
app.get("/cartas/aleatoria", (req, res) => {

    const card = cards[Math.floor(Math.random() * cards.length)];

    if (!card) {
        return res.send(page(
            "Carta aleatória",
            "<h1>Não existem cartas disponíveis.</h1>"
        ));
    }

    res.send(page(
        "Carta aleatória",
        `
        <div class="card">
            <h1>${card.name}</h1>
            <p>Tipo: ${card.type}</p>
            <p>Ataque: ${card.attack}</p>
            <p>Defesa: ${card.defense ?? "Não definida"}</p>
        </div>
        `
    ));
});

// Página com a data e hora
app.get("/agora", (req, res) => {

    const data = new Date();

    res.send(page(
        "Agora",
        `
        <h1>Data e hora atuais</h1>
        <p>${data.toLocaleString("pt-PT")}</p>
        `
    ));
});

// API GET - listar cartas
app.get("/api/cartas", (req, res) => {

    const tipo = req.query.tipo;

    if (tipo) {
        const filtradas = cards.filter(card => card.type === tipo);
        return res.json(filtradas);
    }

    res.json(cards);
});

// API GET - carta aleatória
app.get("/api/cartas/aleatoria", (req, res) => {

    if (cards.length === 0) {
        return res.status(404).json({
            erro: "Não existem cartas disponíveis."
        });
    }

    const card = cards[Math.floor(Math.random() * cards.length)];

    res.json(card);
});

// API POST - adicionar carta
app.post("/api/cartas", (req, res) => {

    const card = req.body;

    // Verificar se a carta tem nome
    if (!card.name || card.name.trim() === "") {
        return res.status(400).json({
            erro: "A carta precisa de um nome."
        });
    }

    // Verificar se a carta tem tipo
    if (!card.type || card.type.trim() === "") {
        return res.status(400).json({
            erro: "A carta precisa de um tipo."
        });
    }

    // Adicionar carta ao array
    cards.push(card);

    // Guardar as cartas no ficheiro JSON
    fs.writeFileSync(
        FILE,
        JSON.stringify(cards, null, 2)
    );

    // Responder com a carta adicionada
    res.status(201).json(card);
});

// Rota não encontrada
app.use((req, res) => {
    res.status(404).send(
        page(
            "Erro 404",
            "<h1>Erro 404 - Página não encontrada</h1>"
        )
    );
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor a funcionar em http://localhost:${PORT}`);
});