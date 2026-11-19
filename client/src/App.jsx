import Card from "./Card.jsx";
import { useState, useEffect } from "react";

function App() {
  const [cards, setCards] = useState([]);
  const [filter, setFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [randomCard, setRandomCard] = useState(null);
  const [sorted, setSorted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados do formulário
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [attack, setAttack] = useState("");
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  // Carregar cartas do servidor
  useEffect(() => {
    setLoading(true);
    setError("");

    const url =
      filter === "Todas"
        ? "http://localhost:3000/api/cartas"
        : `http://localhost:3000/api/cartas?tipo=${encodeURIComponent(filter)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        setCards(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter]);

  // Pesquisa
  let visible = cards.filter((card) =>
    card.name.toLowerCase().includes(search.toLowerCase())
  );

  // Ordenar por ataque
  if (sorted) {
    visible = [...visible].sort((a, b) => b.attack - a.attack);
  }

  // Carta aleatória
  function pickRandom() {
    fetch("http://localhost:3000/api/cartas/aleatoria")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        setRandomCard(data);
      })
      .catch((err) => {
        console.error("Erro ao obter carta aleatória:", err);
      });
  }

  // Adicionar carta através do POST
  async function handleSubmit(e) {
    e.preventDefault();

    setFormError("");
    setSending(true);

    const card = {
      name: name,
      type: type,
      attack: Number(attack),
    };

    try {
      const response = await fetch("http://localhost:3000/api/cartas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(card),
      });

      // Verificar se ocorreu um erro
      if (!response.ok) {
        setFormError(`HTTP ${response.status}`);
        return;
      }

      // Receber a carta devolvida pelo servidor
      const newCard = await response.json();

      // Adicionar a carta à lista
      setCards((previousCards) => [...previousCards, newCard]);

      // Limpar formulário
      setName("");
      setType("");
      setAttack("");
    } catch (err) {
      setFormError("Erro ao comunicar com o servidor");
    } finally {
      setSending(false);
    }
  }

  return (
    <main>
      <h1>A minha coleção</h1>

      <p>
        Tenho {cards.length} cartas · a mostrar {visible.length}
      </p>

      {/* Formulário para adicionar cartas */}
      <h2>Adicionar carta</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome da carta"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Selecionar tipo</option>
          <option value="Criatura">Criatura</option>
          <option value="Feitiço">Feitiço</option>
        </select>

        <input
          type="number"
          placeholder="Ataque"
          value={attack}
          onChange={(e) => setAttack(e.target.value)}
        />

        <button type="submit" disabled={sending}>
          {sending ? "A enviar..." : "Adicionar carta"}
        </button>
      </form>

      {/* Erro do formulário */}
      {formError && (
        <p style={{ color: "red" }}>
          {formError}
        </p>
      )}

      {/* Filtros */}
      <div>
        <button onClick={() => setFilter("Todas")}>
          Todas
        </button>

        <button onClick={() => setFilter("Criatura")}>
          Só criaturas
        </button>

        <button onClick={() => setFilter("Feitiço")}>
          Só feitiços
        </button>

        <button onClick={() => setSorted(!sorted)}>
          {sorted ? "Ordem original" : "Ordenar por ataque"}
        </button>
      </div>

      {/* Pesquisa */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Procurar pelo nome…"
      />

      {/* Carregamento */}
      {loading && <p>A carregar...</p>}

      {/* Erro de carregamento */}
      {error && (
        <p>Erro ao carregar as cartas: {error}</p>
      )}

      {/* Lista de cartas */}
      {!loading && !error && (
        <>
          {visible.length === 0 ? (
            <p>Nenhuma carta corresponde.</p>
          ) : (
            <ul>
              {visible.map((card) => (
                <Card key={card.name} {...card} />
              ))}
            </ul>
          )}
        </>
      )}

      {/* Carta aleatória */}
      <h2>Carta à sorte</h2>

      <button onClick={pickRandom}>
        Escolher outra
      </button>

      {randomCard && (
        <p>
          <b>{randomCard.name}</b> — {randomCard.type} · ataque{" "}
          {randomCard.attack} · defesa {randomCard.defense}
        </p>
      )}
    </main>
  );
}

export default App;