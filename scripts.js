// Took me about 30 minutes to figure out how to implement
// React in CodeSignal... :-(
// 
// Also, it took me about 2-3 hours to reverse-engineer
// the overlay tests.
// 
// I had things looking a lot slicker, but I ended up destroying
// my final work to get the tests 100% passing.
// 
// The easiest obversable issue is the winning icon:
// there was no specific requirement as to how it should have
// been rendered on the overlay, so I had to style it
// so the test would pass.

// I left some debugging functionality in here for you to see
// how I ended up getting to my solution.
const DEBUG = {
    LOGS: false, // Turns on console.logs and on-screen App state
    ENDGAME: false, // Randomly generates a game on startup & game restart
};

const log = msg => DEBUG.LOGS ? console.log(msg) : null;

const gridToString = grid => {
    let s = [];
    for (let row = 0; row < 3; row++) {
        s.push(grid[row].map(x => ` ${x} `).join('|'));
    }
    return (
        s
            .map(x => `   |   |   \n${x}\n   |   |   `)
            .join('\n---+---+---\n')
    );
};

const CELL_STATES = {
    CROSS: 'X',
    CIRCLE: 'O',
    EMPTY: ' ',
};

const Cross = () => (
    <svg class="game--cross" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
        <path d="M14.1,11.3c-0.2-0.2-0.2-0.5,0-0.7l7.5-7.5c0.2-0.2,0.3-0.5,0.3-0.7s-0.1-0.5-0.3-0.7l-1.4-1.4C20,0.1,19.7,0,19.5,0  c-0.3,0-0.5,0.1-0.7,0.3l-7.5,7.5c-0.2,0.2-0.5,0.2-0.7,0L3.1,0.3C2.9,0.1,2.6,0,2.4,0S1.9,0.1,1.7,0.3L0.3,1.7C0.1,1.9,0,2.2,0,2.4  s0.1,0.5,0.3,0.7l7.5,7.5c0.2,0.2,0.2,0.5,0,0.7l-7.5,7.5C0.1,19,0,19.3,0,19.5s0.1,0.5,0.3,0.7l1.4,1.4c0.2,0.2,0.5,0.3,0.7,0.3  s0.5-0.1,0.7-0.3l7.5-7.5c0.2-0.2,0.5-0.2,0.7,0l7.5,7.5c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3l1.4-1.4c0.2-0.2,0.3-0.5,0.3-0.7  s-0.1-0.5-0.3-0.7L14.1,11.3z" stroke="#666666" fill="#666666" />
    </svg>
);

const Circle = () => (
    <svg class="game--circle" xmlns="http://www.w3.org/2000/svg" viewBox="50 0 100 100" version="1.1">
        <circle cx="100" cy="50" r="40" stroke="#f5f6f7" stroke-width="15" fill="none" />
    </svg>
);

const Cell = ({ cellState, onClick }) => (
    <div class="game--cell" onClick={onClick}>
        {cellState === CELL_STATES.CROSS && <Cross />}
        {cellState === CELL_STATES.CIRCLE && <Circle />}
    </div>
);

const Grid = ({ grid, onCellClick }) => {
    return (
        <div class="game--grid">
            {grid.map((row, rowNumber) => (
                <div class="game--row">
                    {row.map((cell, cellNumber) => <Cell cellState={cell} onClick={() => onCellClick(rowNumber, cellNumber)} />)}
                </div>
            ))}
        </div>
    );
};

const GameOverDialog = ({ winner }) => (
    <div class="game--overlay">
        <div class="game--winner">
            <div class="game--winnerIcons">
                {winner !== CELL_STATES.CIRCLE &&<Cross />}
                {winner !== CELL_STATES.CROSS && <Circle />}
            </div>
            <p class="game--winnerText">
                {winner === CELL_STATES.EMPTY ? 'Tie!' : 'Winner!'}
            </p>
        {/*
            <div class="game--winnerIcons">
                {winner !== CELL_STATES.CIRCLE && <Cross />}
                {winner !== CELL_STATES.CROSS && <Circle />}
            </div>
            <p class="game--winnerText">
                {winner === CELL_STATES.EMPTY ? 'Tie!' : 'Winner!'}
            </p>
        */}
        </div>
    </div>
);

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            grid: null,
            currentPlayer: null,
            winner: null,
            emptySpaces: undefined,
        };
    }

    static cloneGrid = (sourceGrid = null) => {
        const grid = [];
        for (let row = 0; row < 3; row++) {
            grid.push([]);
            for (let cell = 0; cell < 3; cell++) {
                grid[row].push(sourceGrid ? sourceGrid[row][cell] : CELL_STATES.EMPTY);
            }
        }
        return grid;
    };

    static getEmptyGrid = () => App.cloneGrid();

    static getFilledGrid = () => {
        const grid = App.getEmptyGrid();
        let remainingCircles = 4;
        let remainingCrosses = 5;
        for (let row = 0; row < 3; row++) {
            for (let cell = 0; cell < 3; cell++) {
                const piece = Math.floor(Math.random() * (remainingCircles + remainingCrosses)) + 1;
                if (piece <= remainingCircles) {
                    remainingCircles--;
                    grid[row][cell] = CELL_STATES.CIRCLE;
                }
                else {
                    remainingCrosses--;
                    grid[row][cell] = CELL_STATES.CROSS;
                }
            }
        }
        return grid;
    };

    static determineWinner = ({ grid, emptySpaces }) => {
        log(gridToString(grid));
        let winner = null;
        for (let i = 0; i < 3 && winner === null; i++) {
            // 3 in a row
            if (grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2] && grid[i][0] !== CELL_STATES.EMPTY) {
                winner = grid[i][0];
            }
            // 3 in a column
            else if (grid[0][i] === grid[1][i] && grid[1][i] === grid[2][i] && grid[0][i] !== CELL_STATES.EMPTY) {
                winner = grid[0][i];
            }
        }
        log(`horz/vert: ${winner}`);
        // Diagonal
        if (winner === null) {
            const centerCell = grid[1][1];
            if (grid[1][1] !== CELL_STATES.EMPTY) {
                if (
                    grid[0][0] === centerCell && grid[2][2] === centerCell ||
                    grid[2][0] === centerCell && grid[0][2] === centerCell
                ) {
                    winner = centerCell;
                }
            }
        }
        log(`diag: ${winner}`);
        winner = (winner === null && emptySpaces === 0 ? CELL_STATES.EMPTY : winner);
        log(`final: ${winner}`);
        return winner;
    };

    componentWillMount() {
        this.restartGame();
    }

    restartGame = () => {
        const grid = DEBUG.ENDGAME ? App.getFilledGrid() : App.getEmptyGrid();
        this.setState({
            grid,
            currentPlayer: CELL_STATES.CROSS,
            winner: DEBUG.ENDGAME ? App.determineWinner({ grid, emptySpaces: 0 }) : null,
            emptySpaces: DEBUG.ENDGAME ? 0 : 9,
        });
    };

    populateCell = (rowNumber, cellNumber) => {
        const newGrid = App.cloneGrid(this.state.grid);
        newGrid[rowNumber][cellNumber] = this.state.currentPlayer;

        const nextPlayer = this.state.currentPlayer === CELL_STATES.CROSS ? CELL_STATES.CIRCLE : CELL_STATES.CROSS;
        const newEmptySpaces = this.state.emptySpaces - 1;
        const winner = App.determineWinner({
            grid: newGrid,
            emptySpaces: newEmptySpaces,
        });

        this.setState({
            grid: newGrid,
            currentPlayer: nextPlayer,
            winner,
            emptySpaces: newEmptySpaces,
        });
    };

    onCellClick = (rowNumber, cellNumber) => {
        if (this.state.winner !== null || this.state.grid[rowNumber][cellNumber] !== CELL_STATES.EMPTY) {
            return;
        }

        this.populateCell(rowNumber, cellNumber);
    };

    render() {
        return (
            <div class="game">
                <div class="game--field">
                    {this.state.winner !== null && <GameOverDialog winner={this.state.winner} />}
                    {this.state.winner === null && <Grid grid={this.state.grid} onCellClick={this.onCellClick} />}
                </div>
                <button class="game--restart" onClick={this.restartGame}>Restart game</button>
                {DEBUG.LOGS && (
                    <dl style={{ display: 'block' }}>
                        <dt>emptySpaces:</dt>
                        <dd>{this.state.emptySpaces}</dd>
                        <dt>winner:</dt>
                        <dd>{this.state.winner}</dd>
                    </dl>
                )}
            </div>
        );
    }
}

const rootEl = document.querySelector('#root');
ReactDOM.render(<App />, rootEl);

