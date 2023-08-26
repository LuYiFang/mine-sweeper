import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import "./App.css";
import _ from "lodash";
import { useEffect, useState } from "react";
import { Box, Button, Container, MenuItem, Select } from "@mui/material";

const cellSize = 30;
const sizeItem = {
  small: {
    width: 10,
    height: 9,
    mine: 18,
    size: "small",
  },
  large: {
    width: 26,
    height: 18,
    mine: 80,
    size: "large",
  },
};

function App() {
  const [boardInfo, setBoardInfo] = useState(sizeItem.large);
  const [realBoard, setRealBoard] = useState([]);
  const [displayBoard, setDisplayBoard] = useState([]);
  const [title, setTitle] = useState("");
  const [mineCount, setMineCount] = useState(boardInfo.mine);

  var leftClick = false;
  var rightClick = false;

  const getIndex = (x, y) => {
    return y * boardInfo.width + x;
  };

  const getDims = (index) => {
    const y = Math.floor(index / boardInfo.width);
    return { x: index % boardInfo.width, y: y };
  };
  const newGame = () => {
    const boardSize = boardInfo.width * boardInfo.height;
    const mineList = _.sampleSize(_.range(boardSize), boardInfo.mine);

    setMineCount(mineList.length);
    setTitle(`${mineList.length}`);

    let newRealBoard = [];

    _.each(_.range(boardInfo.height), (y) => {
      _.each(_.range(boardInfo.width), (x) => {
        const index = getIndex(x, y);
        if (_.includes(mineList, index)) {
          newRealBoard.push("x");
          return;
        }

        let minX = x - 1;
        if (minX < 0) minX = 0;
        let maxX = x + 2;
        if (maxX > boardInfo.width) maxX = boardInfo.width;

        let minY = y - 1;
        if (minY < 0) minY = 0;
        let maxY = y + 2;
        if (maxY > boardInfo.height) maxY = boardInfo.height;

        let surroundArea = [];
        _.each(_.range(minY, maxY), (_y) => {
          _.each(_.range(minX, maxX), (_x) => {
            if (_x === x && _y === y) return;

            const _index = getIndex(_x, _y);
            surroundArea.push(_index);
          });
        });

        const mineCount = _.intersection(mineList, surroundArea).length;

        newRealBoard.push(mineCount);
      });
    });

    setRealBoard(newRealBoard);
    setDisplayBoard(Array(boardSize).fill("untrigger"));
  };

  const trigger = (index, newDisplayBoard) => {
    if (!newDisplayBoard) {
      newDisplayBoard = [...displayBoard];
    }

    const currentValue = realBoard[index];
    if (currentValue === "x") {
      gameOver();
      return;
    }

    if (currentValue !== 0) {
      newDisplayBoard[index] = "number";
      setDisplayBoard(newDisplayBoard);
      return;
    }

    const { x, y } = getDims(index);
    spread(x, y, newDisplayBoard);
    setDisplayBoard(newDisplayBoard);
    return newDisplayBoard;
  };

  const triggerFlag = (index) => {
    if (displayBoard[index] === "number") return;

    const newDisplayBoard = [...displayBoard];

    let newMineCount = mineCount + 1;
    let classValue = "untrigger";
    if (newDisplayBoard[index] !== "flag") {
      newMineCount -= 2;

      classValue = "flag";
    }

    console.log("new", newMineCount);
    setMineCount(newMineCount);
    newDisplayBoard[index] = classValue;
    setDisplayBoard(newDisplayBoard);
  };

  const spread = (x, y, newDisplayBoard) => {
    let spreadQueue = [];

    const nextGrid = (x, y) => {
      if (x < 0) return;
      if (x >= boardInfo.width) return;

      if (y < 0) return;
      if (y >= boardInfo.height) return;

      const index = getIndex(x, y);

      if (_.includes(spreadQueue, index)) return;
      spreadQueue.push(index);

      if (realBoard[index] !== 0 && displayBoard[index] !== "flag") {
        newDisplayBoard[index] = "number";
        return;
      }

      if (displayBoard[index] !== "flag") {
        newDisplayBoard[index] = "safe";
      }

      nextGrid(x - 1, y - 1);
      nextGrid(x, y - 1);
      nextGrid(x + 1, y - 1);
      nextGrid(x - 1, y);
      nextGrid(x + 1, y);
      nextGrid(x - 1, y + 1);
      nextGrid(x, y + 1);
      nextGrid(x + 1, y + 1);
    };

    nextGrid(x, y);
  };

  const autoSpread = (index) => {
    const { x, y } = getDims(index);

    let minX = x - 1;
    if (minX < 0) minX = 0;
    let maxX = x + 2;
    if (maxX > boardInfo.width) maxX = boardInfo.width;

    let minY = y - 1;
    if (minY < 0) minY = 0;
    let maxY = y + 2;
    if (maxY > boardInfo.height) maxY = boardInfo.height;

    let flagCount = 0;
    let mineCount = 0;
    let surroundArea = [];
    _.each(_.range(minY, maxY), (_y) => {
      _.each(_.range(minX, maxX), (_x) => {
        if (_x === x && _y === y) return;

        const _index = getIndex(_x, _y);
        if (displayBoard[_index] === "flag") flagCount++;
        if (realBoard[_index] === "x") mineCount++;

        surroundArea.push(_index);
      });
    });

    if (flagCount !== mineCount) {
      return;
    }

    let newDisplayBoard = [...displayBoard];

    _.each(surroundArea, (_index) => {
      if (displayBoard[_index] !== "untrigger") return;
      trigger(_index, newDisplayBoard);
    });
  };

  const checkGameStatus = () => {
    let flagCount = 0;
    let isUnfinished = _.some(displayBoard, (status, i) => {
      if (status === "untrigger") return true;
      if (status === "flag") {
        flagCount++;
      }
    });

    if (flagCount < mineCount) {
      isUnfinished = true;
    }

    if (!isUnfinished) {
      setTitle("You Win!");
    }
  };

  const gameOver = () => {
    setTitle("game over");
    setDisplayBoard(
      _.map(_.range(boardInfo.height * boardInfo.width), (index) => {
        if (realBoard[index] === "x") return "mine";
        if (realBoard[index] === 0) return "safe";
        return "number";
      }),
    );
  };

  const handleTrigger = _.debounce((index) => {
    if (leftClick && rightClick) {
      autoSpread(index);
      leftClick = false;
      rightClick = false;
      return;
    }

    if (leftClick) {
      trigger(index);
      leftClick = false;
      return;
    }

    triggerFlag(index);
    rightClick = false;
  }, 100);

  const handleClick = (e) => {
    if (e.button === 0) {
      leftClick = true;
    } else if (e.button === 2) {
      rightClick = true;
    }

    handleTrigger(e.target.getAttribute("index"));
  };

  useEffect(() => {
    newGame();

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useEffect(() => {
    newGame();
  }, [boardInfo.size]);

  useEffect(() => {
    setTitle(`${mineCount}`);
  }, [mineCount]);

  useEffect(() => {
    checkGameStatus();
  }, [displayBoard]);

  return (
    <div className="App">
      <main className="full-size">
        <Grid2
          container
          className="full-size flex-vertical-center"
          rowSpacing={2}
        >
          <Grid2 xs={12}>
            <Select
              size="small"
              value={boardInfo.size}
              onChange={(e) => {
                setBoardInfo(sizeItem[e.target.value]);
              }}
            >
              {_.map(_.keys(sizeItem), (k) => {
                return (
                  <MenuItem key={`size-item-${k}`} value={k}>
                    {k}
                  </MenuItem>
                );
              })}
            </Select>
          </Grid2>
          <Grid2 xs={12} className="board-title">
            {title}
          </Grid2>
          <Grid2 xs={12} container>
            <Box className="full-size flex-center">
              <Grid2
                container
                xs={12}
                columns={boardInfo.width}
                style={{
                  width: boardInfo.width * cellSize,
                  height: boardInfo.height * cellSize,
                }}
              >
                {_.map(displayBoard, (value, index) => {
                  return (
                    <Grid2
                      key={`cell-box-${index}`}
                      className="cell-box"
                      style={{
                        width: cellSize,
                        height: cellSize,
                      }}
                      xs={1}
                    >
                      <div
                        className={value}
                        onMouseDown={handleClick}
                        index={index}
                      >
                        {value === "flag" ? "" : realBoard[index]}
                      </div>
                    </Grid2>
                  );
                })}
              </Grid2>
            </Box>
          </Grid2>
          <Grid2 xs={12}>
            <Container maxWidth="sm" className="flex-end">
              <Button variant="contained" onClick={() => newGame()}>
                new game
              </Button>
            </Container>
          </Grid2>
        </Grid2>
      </main>
    </div>
  );
}

export default App;
