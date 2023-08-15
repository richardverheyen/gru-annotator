import React, { useRef, useEffect, useState } from 'react';
import gruImage from './assets/gru-despicable-me.png'
import './App.css'
import handleDownload from './handleDownload';

function App() {
  const [data, setData] = useState(null);
  const [trainingRecords, setTrainingRecords] = useState([]);
  const [isContact, setIsContact] = useState(false);
  const [timestamp, setTimestamp] = useState(0);
  const canvasRef = useRef(null);

  const canvasWidth = window.innerWidth < 1400 ? window.innerWidth / 2 : 700; // You can set this to any value
  const canvasHeight = (canvasWidth * 9) / 16; // Calculate the height based on a 16:9 ratio

  const iterationData = (data, timestamp) => {
    // Determine the range of timestamps around the current timestamp
    const lowerBound = timestamp - 1 / 3 - 0.01; // at 10 frames 30fps = 1/3 of a second
    const upperBound = timestamp + 1 / 3 + 0.01; // and we add a little because it's not perfect
  
    // Initialize an array for the result
    const result = [];
  
    // Iterate through the range, incrementing by 1/30th of a second
    for (let currentTimestamp = lowerBound; currentTimestamp <= upperBound; currentTimestamp += 1/30) {
      // Try to find the existing data object for the current timestamp
      const item = data?.find(d => Math.abs(d.timestamp - currentTimestamp) <= 0.02);
      
      // If the item exists, push it to the result array; otherwise, push a default object
      if (item) {
        result.push(item);
      } else {
        result.push({
          height: 0,
          timestamp: currentTimestamp,
          width: 0,
          x: 0,
          y: 0
        });
      }
    }

    return result;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const radius = 2; // 4px diameter circle
    let emptyNodeIndex = 0;
  
    // Iterate through the data and draw the circles and text
    iterationData(data, timestamp)?.forEach((item, index) => {
      ctx.beginPath();
      if (item.height === 0 && item.width === 0) {
        // Draw in the bottom left corner for empty data
        ctx.arc(radius, canvas.height - (emptyNodeIndex * 14) - radius - 8, radius, 0, 2 * Math.PI);
        emptyNodeIndex++;
        ctx.font = '12px Arial'; // Set font size to 12px for empty nodes
      } else {
        // Draw the circle based on the item's data
        ctx.arc(item.x * canvas.width, item.y * canvas.height, radius, 0, 2 * Math.PI);
        ctx.font = '0px Arial'; // Set font size to 9px for other nodes
      }
      
      // Set the color based on the timestamp
      if (Math.abs(item.timestamp - timestamp) <= 0.02) {
        ctx.fillStyle = 'green';
        ctx.strokeStyle = 'green';
      } else if (item.timestamp < timestamp) {
        ctx.fillStyle = 'blue';
        ctx.strokeStyle = 'blue';
      } else {
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'yellow';
      }
      
      // Draw the circle
      ctx.fill();
      ctx.stroke();
  
      // Draw the text next to the circle
      const textX = (item.height === 0 && item.width === 0) ? (radius * 5) : (item.x * canvas.width) + (radius * 2);
      const textY = (item.height === 0 && item.width === 0) ? canvas.height - (emptyNodeIndex * 14) + (radius * 8) - 8 : (item.y * canvas.height) + radius;
      ctx.fillText(item.timestamp.toFixed(2) + 's', textX, textY);

    });
  }, [data, timestamp]);

  const incrementTimestamp = () => {
    changeTimestamp(1/30)
  };

  const decrementTimestamp = () => {
    changeTimestamp(-1/30)
  };

  const changeTimestamp = val => {
    let currentValues = iterationData(data, timestamp);

    let newTrainingRecord = {
      "label": isContact ? 1 : 0,
      "timestamp": timestamp,
      "sequence": [
        ...currentValues.map(cgrect => ([
          cgrect.x,
          cgrect.y,
          cgrect.width,
          cgrect.height,
        ]))
      ]
    }

    setTrainingRecords([...trainingRecords.filter(r => r.timestamp !== timestamp), newTrainingRecord])

    setIsContact(false);
    setTimestamp(prevTimestamp => prevTimestamp + val);
  }

  const handleKeypress = e => {
    console.log(e.key)
    switch (e.key) {
      case "ArrowLeft":
        decrementTimestamp();
        break;
      case "ArrowUp":
        decrementTimestamp();
        break;
      case "ArrowRight":
        incrementTimestamp();
        break;
      case "ArrowDown":
        incrementTimestamp();
        break;
      case " ":
        setIsContact(!isContact);
        break;
    
      default:
        break;
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          setData(jsonData);
          console.log({jsonData});
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };

      reader.readAsText(file);
    }
  };

  return (
    <>
    <header className='flex justify-between items-center w-full mb-8'>
      <input type="file" accept=".json" onChange={handleFileChange} />
      <button onClick={() => handleDownload(trainingRecords)}>Download JSON</button>
    </header>

    <main className='flex' onKeyUp={handleKeypress}>
      
      <div className='flex flex-col'>
        <div className="flex w-full">
          <h1>Gru's CGRect Annotator</h1>
          <img width="60" src={gruImage} alt="" className="-mt-6 ml-6 " />
        </div>

        <div className='flex items-center'>
          <p className='font-mono text-green-600'>current timestamp: {timestamp.toFixed(4)}</p>
          <button className="ml-auto" autoFocus>Use arrowkeys to navigate</button>
        </div>

        <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>
        
      </div>
      <ol className='ml-auto'>
        {
          iterationData(data, timestamp)?.map((item, index) => (
            <li className={`list-decimal font-mono mb-1 ${index == 10 ? "text-green-600" : index < 10 ? "text-blue-600" : "text-yellow-300"}`} key={index}>{item.timestamp.toFixed(4)}s: {item.x.toFixed(3)} {item.y.toFixed(3)}</li>
          ))
        }
      </ol>

    </main>
    </>
  )
}

export default App
