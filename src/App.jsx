import { useState } from 'react'
import gruImage from './assets/gru-despicable-me.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className='flex'>
      <div>
        <h1>Gru Annotator</h1>

      </div>
      <img src={gruImage} alt="" className="m-4" />
    </main>
  )
}

export default App
