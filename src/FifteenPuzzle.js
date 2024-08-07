import React, { useState, useEffect } from 'react';

const FifteenPuzzle = () => {
  const [board, setBoard] = useState([]);
  const [moves, setMoves] = useState(0);
  const [rowIndicators, setRowIndicators] = useState([]);
  const [colIndicators, setColIndicators] = useState([]);
  const [showNumbers, setShowNumbers] = useState(false);
  const [solvedWithHiddenNumbers, setSolvedWithHiddenNumbers] = useState(true);
  const [hasBeenSolved, setHasBeenSolved] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    initializeBoard();
  }, []);

  const shuffleBoard = () => {
    const numbers = Array.from({ length: 15 }, (_, i) => i + 1);
    numbers.push(null);

    // Step 1: ランダムにシャッフル
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    // Step 2: パリティを計算
    const parity = calculateParity(numbers);

    // Step 3: 必要に応じてパリティを調整
    if (parity % 2 === 0) {
      // パリティが偶数の場合、2つの隣接するタイルを交換
      let index1 = numbers.findIndex(n => n !== null);
      let index2 = numbers.findIndex((n, i) => n !== null && i > index1);
      [numbers[index1], numbers[index2]] = [numbers[index2], numbers[index1]];
    }

    return numbers;
  };

  const calculateParity = (board) => {
    let parity = 0;
    const flatBoard = board.filter(tile => tile !== null); // nullを除外

    for (let i = 0; i < flatBoard.length; i++) {
      for (let j = i + 1; j < flatBoard.length; j++) {
        if (flatBoard[i] > flatBoard[j]) {
          parity++;
        }
      }
    }

    // 空白タイルの行番号を加算（0-indexedで計算）
    parity += Math.floor(board.indexOf(null) / 4);

    return parity;
  };

  const initializeBoard = () => {
    const numbers = shuffleBoard();
    setBoard(numbers);
    setMoves(0);
    updateIndicators(numbers);
    setShowNumbers(false);
    setHasBeenSolved(false);
    setSolvedWithHiddenNumbers(true);
  };

  const handleShuffleClick = () => {
    initializeBoard();
  };

  const handleTileClick = (index) => {
    const emptyIndex = board.indexOf(null);
    if (canMove(index, emptyIndex)) {
      const newBoard = [...board];
      [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
      setBoard(newBoard);
      if (!hasBeenSolved) {
        setMoves(moves + 1);
      }
      updateIndicators(newBoard);

      if (!hasBeenSolved && isSolved(newBoard)) {
        setHasBeenSolved(true);
        setShowNumbers(true);
      }
    }
  };

  const canMove = (index, emptyIndex) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;
    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  };

  const updateIndicators = (currentBoard) => {
    const newRowIndicators = [];
    const newColIndicators = [];

    for (let i = 0; i < 4; i++) {
      let rowEat = 0, rowBite = 0, colEat = 0, colBite = 0;
      for (let j = 0; j < 4; j++) {
        const rowIndex = i * 4 + j;
        const colIndex = j * 4 + i;
        const rowCorrectValue = rowIndex + 1;
        const colCorrectValue = colIndex + 1;

        if (currentBoard[rowIndex] === rowCorrectValue) {
          rowEat++;
        } else if (currentBoard[rowIndex] !== null && Math.floor((currentBoard[rowIndex] - 1) / 4) === i) {
          rowBite++;
        }

        if (currentBoard[colIndex] === colCorrectValue) {
          colEat++;
        } else if (currentBoard[colIndex] !== null && (currentBoard[colIndex] - 1) % 4 === i) {
          colBite++;
        }
      }
      newRowIndicators.push({ eat: rowEat, bite: rowBite });
      newColIndicators.push({ eat: colEat, bite: colBite });
    }

    // 5番目の列インジケーターを追加
    newColIndicators.push({ eat: 0, bite: 0 });

    setRowIndicators(newRowIndicators);
    setColIndicators(newColIndicators);
  };

  const isSolved = (currentBoard) => {
    for (let i = 0; i < 15; i++) {
      if (currentBoard[i] !== i + 1) return false;
    }
    return currentBoard[15] === null;
  };

  const handleToggleNumbers = () => {
    if (!hasBeenSolved) {
      setShowNumbers(!showNumbers);
      // 表示切替時にsolvedWithHiddenNumbersの設定を変更
      if (solvedWithHiddenNumbers) {
        setSolvedWithHiddenNumbers(false);
      }
    }
  };

  const handleToggleRules = () => {
    setShowRules(!showRules);
  };

  // ルール表示画面のコンポーネント
  const RulesScreen = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">ゲームルール</h2>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>1～15までのタイルをZ字の順に並べてください。</li>
        <li>緑の数字は列/行ともに正しいタイルの数を表します。</li>
        <li>黄色の数字は列/行一方のみが正しいタイルの数を表します。</li>
      </ul>
      <button
        onClick={handleToggleRules}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
      >
        ゲーム画面に戻る
      </button>
    </div>
  );

  // メインのゲーム画面
  const GameScreen = () => (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between mb-2">
        <button
          onClick={handleShuffleClick}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
        >
          シャッフル
        </button>
        <button
          onClick={handleToggleRules}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
        >
          ルール表示
        </button>
        <button
          onClick={handleToggleNumbers}
          className={`px-3 py-1 ${hasBeenSolved ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'} text-gray-800 rounded transition-colors duration-200`}
          disabled={hasBeenSolved}
        >
          {showNumbers ? '数字を隠す' : '数字を表示'}
        </button>
      </div>
      {/* 列インジケーター */}
      <div className="flex mb-2">
        <div className="grid grid-cols-4 gap-2">
          {colIndicators.slice(0, 4).map((indicator, index) => (
            <div
              key={index}
              className="flex flex-col items-center w-16"
            >
              <span className="w-8 h-8 flex items-center justify-center text-xl font-bold rounded-full bg-yellow-500 text-white">
                {indicator.bite}
              </span>
              <span className="w-8 h-8 flex items-center justify-center text-xl font-bold rounded-full bg-green-500 text-white mt-1">
                {indicator.eat}
              </span>
            </div>
          ))}
        </div>
      </div>
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex items-center mb-2">
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((col) => {
              const index = row * 4 + col;
              const tile = board[index];
              return (
                <button
                  key={index}
                  className={`
                    w-16 h-16 text-2xl font-bold
                    ${tile ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200'}
                    rounded-lg focus:outline-none transition-colors duration-200
                  `}
                  onClick={() => handleTileClick(index)}
                  disabled={tile === null}
                >
                  {(showNumbers || hasBeenSolved) ? tile : (tile && '?')}
                </button>
              );
            })}
          </div>
          {/* 行インジケーター */}
          <div className="ml-4 flex items-center w-20">
            <span className="w-8 h-8 flex items-center justify-center text-xl font-bold rounded-full bg-green-500 text-white mr-2">
              {rowIndicators[row]?.eat || 0}
            </span>
            <span className="w-8 h-8 flex items-center justify-center text-xl font-bold rounded-full bg-yellow-500 text-white">
              {rowIndicators[row]?.bite || 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">15パズル×ヌメロン</h1>
      {showRules ? <RulesScreen /> : <GameScreen />}
      <p className="mt-4 text-xl">移動回数: {moves}</p>
      {hasBeenSolved && (
        <div className="mt-4 text-2xl font-bold text-green-600">
          おめでとうございます！パズルを解きました！
          {solvedWithHiddenNumbers && <p>数字を隠したまま解きました！</p>}
        </div>
      )}
    </div>
  );
};

export default FifteenPuzzle;