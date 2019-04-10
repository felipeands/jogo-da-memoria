import React, { Component } from 'react';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      delayLoading: 3000,
      tentativas: 0,
      emoji: '',
      animais: this.getAnimais(),
      cards: [],
      virados: [],
      acertos: [],
      repetir: 3
    }
  }

  componentDidMount() {
    this.startNewGame();
  }

  getAnimais() {
    return ['🐒', '🐝', '🐊', '🐇', '🐆', '🦎'];
  }

  onClickStart(ev) {
    ev.preventDefault();
    this.startNewGame();
  }

  startNewGame() {
    let cards = [];
    let count = 0;

    // passa pelos animais
    this.state.animais.map((animal, index) => {
      // inclui a quantidade de vezes informada
      for (let repetiu = 0; repetiu < this.state.repetir; repetiu++) {
        count++;
        cards.push({ id: count, name: animal });
      }
    });
    cards = this.shuffle(cards);
    const emojis = ['😃', '😙', '😊', '😃', '😂'];
    let emoji = emojis[Math.floor(Math.random() * emojis.length)];
    this.setState({ cards, virados: [], acertos: [], emoji: emoji, tentativas: 0 });
  }

  shuffle(array) {

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

  isCardActive(card) {
    return this.state.virados.filter((virado) => {
      return card.id === virado.id;
    }).length > 0;
  }

  isCardAcerto(card) {
    return this.state.acertos.filter((acerto) => {
      return card.name === acerto;
    }).length > 0;
  }

  onClickCard(card) {

    if (!this.state.isLoading) {

      // verifica se já é ativo
      if (!this.isCardActive(card)) {

        // verifica se tem a quantidade de itens selecionados
        if (this.state.virados.length === this.state.repetir - 1) {

          const tentativas = this.state.tentativas;

          this.setState({ isLoading: true, tentativas: tentativas + 1 });
          this.activateCard(card);

          setTimeout(() => {

            const acertou = this.state.virados.filter((virado) => {
              return virado.name === card.name && virado.id !== card.id;
            }).length === this.state.repetir - 1;

            if (acertou) {
              this.acertaCard(card);

              // verifica se ganhou
              if (this.countRestantes() === 0) {
                if (window.confirm(`Você ganhou com ${this.state.tentativas} tentativas 👍 Quer jogar denovo?`)) {
                  this.startNewGame();
                }
              }
            }
            this.setState({ isLoading: false, virados: [] });

          }, this.state.delayLoading);

        } else {
          this.activateCard(card);
        }


      } else {
        this.desactivateCard(card);
      }

    }
  }

  activateCard(card) {
    const virados = [...this.state.virados, card];
    this.setState({ virados: virados });
  }

  acertaCard(card) {
    const acertos = [...this.state.acertos, card.name];
    this.setState({ acertos: acertos });
  }

  desactivateCard(card) {
    let virados = [...this.state.virados];
    virados = virados.filter((virado) => {
      return virado !== card;
    });
    this.setState({ virados: virados });
  }

  countAcertos() {
    return this.state.acertos.length;
  }

  countRestantes() {
    return (this.state.cards.length / 2) - this.countAcertos();
  }

  render() {
    let cards = this.state.cards;
    let acertos = this.countAcertos();
    let restantes = this.countRestantes();
    let isLoading = this.state.isLoading;
    let emoji = this.state.emoji;

    let linha;
    if (restantes > 0) {
      linha = <h3>Você já encontrou {acertos} {acertos === 1 ? 'animal' : 'animais'}. Ainda {restantes === 1 ? 'falta' : 'faltam'} {restantes}.</h3>
    } else {
      linha = <button className="btn" onClick={(e) => this.onClickStart(e)}>Jogar denovo!</button>
    }

    return (
      <div className="container">

        {linha}

        <div className={"cards " + (isLoading ? 'loading' : '')}>
          {cards.map((card) =>
            <div key={card.id} className="card">
              <div
                className={"flip-container "
                  + (this.isCardActive(card) ? 'active ' : '')
                  + (this.isCardAcerto(card) ? 'acerto ' : '')}
                onClick={(e) => this.onClickCard(card)}>
                <div className="flipper">
                  <div className="front">
                    {emoji}
                  </div>
                  <div className="back">
                    {card.name}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
