import { useState, useRef, useEffect } from 'react';
import { getRandomWord, isValidWord, isCorrectAnswer } from './wordleUtils';

import './App.css';

function App() {
  const rows = 6;
  const cols = 5;

  const [grid, setGrid] = useState(
    Array.from({ length: rows }, () => Array(cols).fill(''))
  );

  const [letterColors, setLetterColors] = useState(
    Array.from({ length: rows }, () => Array(cols).fill(null))
  );

  const [keyboardColors, setKeyboardColors] = useState({});

  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);

  const inputRefs = useRef(
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null)
    )
  );

  const [answer, setAnswer] = useState(getRandomWord());
  console.log(answer)

  const getCurrentWord = () => {
    return grid[currentRow].join('');
  };

  const colorClasses = {
    '1': 'border-2 border-green-500 text-green-500',
    '0': 'border-2 border-yellow-500 text-yellow-500',
    '-1': 'border-2 border-gray-500 text-gray-500'
  };

  useEffect(() => {
    const input = inputRefs.current[currentRow][currentCol];
    input?.focus();
  }, [currentRow, currentCol]);

  const updateKeyboardColors = (guess, result) => {
    setKeyboardColors((prev) => {
      const updated = { ...prev };
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const current = updated[letter];

        if (current === 1) continue;
        if (current === 0 && result[i] === -1) continue;

        updated[letter] = result[i];
      }
      return updated;
    });
  };

  const handleKeyDown = (e) => {
    const key = e.key;

    if (/^[a-zA-Z]$/.test(key)) {
      if (currentCol >= cols) return;

      const newGrid = [...grid];
      newGrid[currentRow][currentCol] = key.toUpperCase();
      setGrid(newGrid);

      if (currentCol < cols - 1) {
        setCurrentCol((prev) => prev + 1);
      } else {
        setCurrentCol(cols);
      }
    }

    if (key === 'Backspace') {
      const newGrid = [...grid];
      if (newGrid[currentRow][currentCol]) {
        newGrid[currentRow][currentCol] = '';
        setGrid(newGrid);
      } else if (currentCol > 0) {
        const newCol = currentCol - 1;
        newGrid[currentRow][newCol] = '';
        setGrid(newGrid);
        setCurrentCol(newCol);
      }
    }

    if (key === 'Enter' && currentCol === cols) {
      const word = getCurrentWord();
      if (isValidWord(word)) {
        const result = isCorrectAnswer(answer, word);

        // Aggiorna colori griglia
        setLetterColors((prev) => {
          const updated = [...prev];
          updated[currentRow] = result;
          return updated;
        });

        // Aggiorna tastiera
        updateKeyboardColors(word, result);

        if (word === answer) {
          alert('Hai indovinato la parola!');
        } else if (currentRow < rows - 1) {
          setCurrentRow((prev) => prev + 1);
          setCurrentCol(0);
        } else {
          alert(`Hai esaurito i tentativi! La parola era: ${answer}`);
        }
      } else {
        alert('Parola non valida!');
      }
    }
  };

  const handleVirtualKey = (key) => {
    handleKeyDown({ key });
  };

  return (
    <div
      className="max-w-md mx-auto p-4 select-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div id="title" className="border-b border-gray-500 pb-2 mb-4">
        <h1 className="uppercase text-2xl font-bold mb-1">Wordle</h1>
        <span className="italic text-sm">Try to guess the word!</span>
      </div>

      <div id="input-rows" className="space-y-2 border-b border-gray-500 pb-4">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 justify-center">
            {row.map((letter, colIndex) => (
              <input
                key={colIndex}
                type="text"
                maxLength="1"
                value={letter}
                readOnly
                ref={(el) => (inputRefs.current[rowIndex][colIndex] = el)}
                className={`w-12 h-12 text-center text-xl font-bold border rounded ${
                  letterColors[rowIndex][colIndex] !== null
                    ? colorClasses[String(letterColors[rowIndex][colIndex])]
                    : 'border-gray-400'
                } ${
                  rowIndex === currentRow && colIndex === currentCol
                    ? 'border-black'
                    : ''
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      <div id="keyboard" className="mt-6 space-y-2">
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM←'].map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.split('').map((key) => (
              <button
                key={key}
                className={`flex justify-center w-10 h-12 rounded text-lg font-semibold hover:bg-gray-300 ${
                  colorClasses[keyboardColors[key]] || 'bg-gray-200'
                }`}
                onClick={() =>
                  handleVirtualKey(key === '←' ? 'Backspace' : key)
                }
              >
                {key === '←' ? '⌫' : key}
              </button>
            ))}
          </div>
        ))}

        <div className="flex justify-center mt-4">
          <button
            key={'Enter'}
            onClick={() => handleVirtualKey('Enter')}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ENTER
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
