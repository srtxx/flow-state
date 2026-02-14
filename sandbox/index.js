const { useState } = React;

const MIN_VALUE = 0;
const MAX_VALUE = 100;

function App() {
  const [value, setValue] = useState(MIN_VALUE);

  const handleAdd = () => {
    setValue(prev => Math.min(prev + 1, MAX_VALUE));
  };

  const handleSub = () => {
    setValue(prev => Math.max(prev - 1, MIN_VALUE));
  };

  const handleMul = () => {
    setValue(prev => Math.min(prev * 2, MAX_VALUE));
  };

  return (
    <div className="container">
      <div className="button-group">
        <button id="add" onClick={handleAdd} className="button">
          +1
        </button>
        <button id="sub" onClick={handleSub} className="button">
          -1
        </button>
        <button id="mul" onClick={handleMul} className="button">
          *2
        </button>
      </div>
      <div id="display" className="display">
        {value}
      </div>
      <div className="bottom-line"></div>œ
    </div>
  );
}

const root = ReactDOM.createRoot(document.body);
root.render(<App />);
