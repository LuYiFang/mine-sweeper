import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import "./App.css";
import _ from "lodash";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";

const cellSize = 30;

function App() {
  const [boardInfo, setBoardInfo] = useState({
    width: 26,
    height: 19,
    mine: 81,
  });
  const [realBoard, setRealBoard] = useState([]);
  const [displayBoard, setDisplayBoard] = useState([]);

  var leftClick = false;
  var rightClick = false;

  const getIndex = (x, y) => {
    return y * boardInfo.width + x;
  };

  const getDims = (index) => {
    const y = index / boardInfo.width;
    return { x: index % boardInfo.width, y: y };
  };
  const newGame = () => {
    const boardSize = boardInfo.width * boardInfo.height;
    const mineList = _.sampleSize(_.range(boardSize, boardInfo.mine));

    let newRealBoard = [];

    _.each(_.range(boardInfo.width), (x) => {
      _.each(_.range(boardInfo.height), (y) => {
        const index = getIndex(x, y);
        if (_.includes(mineList, index)) {
          newRealBoard.push("x");
          return;
        }

        let surroundArea = [];
        _.each(_.range(x - 1, x + 2), (_x) => {
          _.each(_.range(y - 1, y + 2), (_y) => {
            if (_x === x && _y === y) return;

            const _index = getIndex(_x, _y);
            surroundArea.push(_index);
          });
        });

        const mineCount = _.intersection(mineList, surroundArea);

        newRealBoard.push(mineCount);
      });
    });

    setRealBoard(newRealBoard);
    setDisplayBoard(Array(boardSize).fill("untrigger"));
  };

  const trigger = () => {
    console.log("left");
  };

  const triggerFlag = () => {
    console.log("right");
  };

  const autoSpread = () => {
    console.log("both");
  };

  const gameOver = () => {};

  const handleTrigger = _.debounce(() => {
    if (leftClick && rightClick) {
      autoSpread();
      leftClick = false;
      rightClick = false;
      return;
    }

    if (leftClick) {
      trigger();
      leftClick = false;
      return;
    }

    triggerFlag();
    rightClick = false;
  }, 100);

  const handleClick = (e) => {
    if (e.button === 0) {
      leftClick = true;
    } else if (e.button === 2) {
      rightClick = true;
    }
    handleTrigger();
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

  return (
    <div className="App">
      <main className="full-size">
        <Grid2 container className="full-size">
          <Grid2 xs={12}>Some Titles</Grid2>
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
                      <div className={value} onMouseDown={handleClick}>
                        {index}
                      </div>
                    </Grid2>
                  );
                })}
              </Grid2>
            </Box>
          </Grid2>
        </Grid2>
      </main>
    </div>
  );
}

export default App;
