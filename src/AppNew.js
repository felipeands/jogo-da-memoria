import { useMemo, useState } from "react";
import './App.css';

const App = () => {

  const delayLoading = 3000;
  const colors = ['color1', 'color2', 'color3'];
  const cardsPath = '/images/cards/';

  const defaultPlayer = {
    tentativas: 0,
    acertos: [],
    vitorias: 0,
    color: '',
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [players, setPlayers] = useState([]);
  const [cards, setCards] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [virados, setVirados] = useState([]);

  const [totalPlayers, setTotalPlayers] = useState(1);
  const [level, setLevel] = useState(1);
  const [repetir, setRepetir] = useState(2);
  const [emoji, setEmoji] = useState('');

  const winnerTentativas = useMemo(() => (winner ? players[winner - 1].tentativas : 0), [winner, players])

  const images = useMemo(() => {


    const imagesFiles = [
      'memoria04.png',
      'memoria05.png',
      'memoria07.png',
      'memoria09.png',
      'memoria10.png',
      'memoria11.png',
      'memoria12.png',
      'memoria13.png',
      'memoria14.png',
      'memoria15.png',
      'memoria22.png',
      'memoria24.png',
    ];

    switch (level) {
      case 1:
        return imagesFiles.slice(0, 2);
      case 2:
        return imagesFiles.slice(0, 5);
      default:
        return imagesFiles;
    }
  }, [level])

  const handleNewGame = (ev) => {
    ev.preventDefault();
    newGame();
  }

  // recomeçar
  const handleReset = (ev) => {
    ev.preventDefault();
    setIsPlaying(false);
    setWinner(null);
  }

  // nova partida
  const newGame = () => {
    setWinner(null);
    setPlayers([]);
    for (let i = 0; i < totalPlayers; i++) {
      addPlayer();
    }

    startGame();
  }

  const startGame = () => {
    setWinner(null);
    setCurrentPlayer(1);
    setPlayers(oldPlayers => oldPlayers.map((player, index) => ({
      ...player,
      tentativas: 0,
      acertos: [],
      color: colors[index]
    })));

    // regra de dificuldade
    // se tiver 11+ precisa achar 3 cartas iguais
    const calcRepetir = level === 4 ? 3 : 2;
    setRepetir(calcRepetir);

    let gameCards = images.reduce((prev, curr) => {
      for (let i = 0; i < calcRepetir; i++) {
        prev.push({ id: prev.length + 1, name: curr });
      }
      return prev;
    }, []);

    gameCards = shuffle(gameCards);
    setCards(gameCards);

    const emojis = ['😃', '😙', '😊', '😃', '😂'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    setEmoji(emoji);

    setIsPlaying(true);
  }

  // novo jogador
  const addPlayer = () => setPlayers(oldPlayers => [...oldPlayers, defaultPlayer]);

  const shuffle = (array) => {

    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  const isCardActive = (card) => (
    !!virados.find(virado => (
      card.id === virado.id
    ))
  );

  const isCardAcerto = (card) => {
    let found = false;
    players.forEach(player => {
      if (player.acertos.find(acerto => card.name === acerto.name)) {
        found = player;
      }
    });
    return found;
  };

  const handleCardClick = (card) => {

    if (!isLoading && !isCardAcerto(card)) {

      // verifica se já é ativo
      if (!isCardActive(card)) {

        activateCard(card);

        // verifica se tem a quantidade de itens selecionados
        if (virados.length === repetir - 1) {
          setIsLoading(true);

          addTentativa(currentPlayer);

          setTimeout(() => {

            const acertou = virados.filter(virado => (
              virado.name === card.name && virado.id !== card.id
            )).length === repetir - 1;

            if (acertou) {
              acertaCard(card, currentPlayer);

              if (countRestantes() === 0) {
                setWinner(currentPlayer);
              }

            }

            setVirados([]);
            setIsLoading(false);
            setCurrentPlayer((oldPlayer) => oldPlayer < totalPlayers ? oldPlayer + 1 : 1)

          }, delayLoading)
        }

      }

    }

  }

  const activateCard = (card) => setVirados(oldVirados => [...virados, card]);

  const acertaCard = (card, currentPlayer) => (
    setPlayers(oldPlayers => oldPlayers.map(({ acertos, ...player }, index) => ({
      ...player,
      acertos: currentPlayer - 1 === index ? [...acertos, card] : acertos
    })))
  )

  const countTotalAcertos = () => players.reduce((prev, curr) => prev + (curr.acertos.length + 1), 0);

  const countRestantes = () => (cards.length / repetir) - countTotalAcertos();

  const addTentativa = (currentPlayer) => setPlayers(oldPlayers =>
    oldPlayers.map(({ tentativas, ...player }, index) => ({
      ...player,
      tentativas: currentPlayer - 1 === index ? tentativas + 1 : tentativas
    }))
  )

  return <>
    {!isPlaying && (
      <div className="overlay">
        <div className="game-options">
          <h1>Sua idade (dificuldade)</h1>
          <div className="level">
            <button className={level === 1 ? 'active' : ''} onClick={() => setLevel(1)}>1-3 anos</button>
            <button className={level === 2 ? 'active' : ''} onClick={() => setLevel(2)}>4-7 anos</button>
            <button className={level === 3 ? 'active' : ''} onClick={() => setLevel(3)}>8-10 anos</button>
            <button className={level === 4 ? 'active' : ''} onClick={() => setLevel(4)}>11+</button>
          </div>

          <h1>Jogadores</h1>
          <div className="players">
            <button className={totalPlayers === 1 ? 'active' : ''} onClick={() => setTotalPlayers(1)}>1 jogador</button>
            <button className={totalPlayers === 2 ? 'active' : ''} onClick={() => setTotalPlayers(2)}>2 jogadores</button>
          </div>
        </div>

        <p>
          <button className="start" onClick={handleNewGame}>COMEÇAR</button>
        </p>
      </div>
    )}

    {winner && (
      <div className="overlay">
        <div className="win">
          {players.length === 1
            ? <h2>VOCÊ GANHOU!</h2>
            : <h2>O JOGADOR {winner} GANHOU!</h2>
          }
          <h3>Com apenas {winnerTentativas} {winnerTentativas === 1 ? 'tentativa' : 'tentativas'}</h3>
          <p>
            <button className="start" onClick={handleReset}>JOGAR DENOVO</button>
          </p>
        </div>
      </div>
    )}

    {isPlaying &&
      <div className="game">
        <div className="container">
          <div className={`cards ${isLoading ? 'loading' : ''}`}>
            {cards.map((card) => {

              const player = isCardAcerto(card)

              return (
                <div key={card.id} className={`card ${player ? 'acerto' : ''} player-${currentPlayer}`}>
                  <div
                    className={`flip-container ${(isCardActive(card) ? 'active player-' + players[currentPlayer - 1].color : '')}
                  ${(player ? 'acerto player-' + player.color : '')}`}
                    onClick={(e) => handleCardClick(card)}>
                    <div className="flipper">
                      <div className="front">
                        {emoji}
                      </div>
                      <div className="back"
                        style={{ backgroundImage: `url("${cardsPath}${card.name}")` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            }
            )}
          </div>
        </div>
      </div>
    }
  </>;

}

export default App;