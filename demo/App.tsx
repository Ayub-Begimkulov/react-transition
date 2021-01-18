import React, { useState } from "react";
import { Transition, TransitionGroup } from "../src";

import "./index.scss";

let nextNum = 10;

function shuffle(array: any[]) {
  const length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  let index = -1;
  const lastIndex = length - 1;
  const result = array.slice();
  while (++index < length) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
    const value = result[rand];
    result[rand] = result[index];
    result[index] = value;
  }
  return result;
}

const App = () => {
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <button
          onClick={() => {
            console.log("click");
            setVisible(v => !v);
          }}
          style={{ marginBottom: 20 }}
        >
          Toggle
        </button>
        {
          <div style={{ height: 250 }}>
            <Transition visible={visible} name="fade">
              <div
                style={{ width: 200, height: 200, background: "black" }}
              ></div>
            </Transition>
          </div>
        }
        {<Sudoku />}
      </div>
      {
        <div style={{ flex: 1 }}>
          <h2>TransitionGroup (add, remove + appear)</h2>
          <RandomNumbers />
        </div>
      }
    </div>
  );
};

const RandomNumbers = () => {
  const [arr, setArr] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const randomIndex = () => {
    return Math.floor(Math.random() * arr.length);
  };

  const add = (idx = randomIndex()) => {
    setArr(arr => [...arr.slice(0, idx), nextNum++, ...arr.slice(idx)]);
  };

  const addFirst = () => {
    add(0);
  };

  const addLast = () => {
    add(arr.length - 1);
  };

  const remove = (idx = randomIndex()) => {
    setArr(arr => [...arr.slice(0, idx), ...arr.slice(idx + 1)]);
  };

  const removeFirst = () => {
    remove(0);
  };

  const removeLast = () => {
    remove(arr.length - 1);
  };

  const shuffleArr = () => {
    setArr(v => shuffle(v));
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <button style={{ margin: 8 }} onClick={() => add()}>
          Add Random
        </button>
        <button style={{ margin: 8 }} onClick={() => addFirst()}>
          Add First
        </button>
        <button style={{ margin: 8 }} onClick={() => addLast()}>
          Add Last
        </button>
        <button style={{ margin: 8 }} onClick={() => shuffleArr()}>
          Shuffle
        </button>
      </div>
      <div style={{ display: "flex" }}>
        <button style={{ margin: 8 }} onClick={() => remove()}>
          Remove Random
        </button>
        <button style={{ margin: 8 }} onClick={() => removeFirst()}>
          Remove First
        </button>
        <button style={{ margin: 8 }} onClick={() => removeLast()}>
          Remove Last
        </button>
      </div>
      <TransitionGroup name="test" appear>
        {arr.map(value => (
          <Transition key={"$" + value}>
            <div style={{ padding: "5px 8px" }} data-key={"$" + value}>
              {value}
            </div>
          </Transition>
        ))}
      </TransitionGroup>
    </div>
  );
};

const makeArr = () => {
  return Array(81)
    .fill(null)
    .map((_, index) => ({
      id: "$" + index,
      number: (index % 9) + 1,
    }));
};

const Sudoku = () => {
  const [numbers, setNumbers] = useState(() => makeArr());

  return (
    <>
      <button onClick={() => setNumbers(v => shuffle(v))}>shuffle</button>{" "}
      <div className="container">
        <TransitionGroup name="cell">
          {numbers.map(({ id, number }) => (
            <Transition key={id}>
              <div className="cell">{number}</div>
            </Transition>
          ))}
        </TransitionGroup>
      </div>
    </>
  );
};

export default App;
