import React, { useState } from 'react';
import gruImage from './assets/gru-despicable-me.png'
import './App.css'

function App() {
  const [data, setData] = useState(null);

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

  const handleDownload = () => {
    const jsonData = JSON.stringify(data, null, 2); // Pretty-print the JSON
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json'; // You can name the file as you like
    a.click();

    URL.revokeObjectURL(url); // Free up memory
  };


  return (
    <main className='flex'>
      <div>
        <h1>Gru Annotator</h1>
        <input type="file" accept=".json" onChange={handleFileChange} />

        {/* visualise */}
        {/* export to new file */}
        
        <button onClick={handleDownload}>Download JSON</button>

      </div>
      <img width="100" src={gruImage} alt="" className="m-4" />
    </main>
  )
}

export default App
