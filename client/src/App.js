import "./App.css";
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div className="App">
      <p>{count}</p>
      <button className="test" onClick={handleClick}>
        Press me!
      </button>
    </div>
  );
}

export default App;
