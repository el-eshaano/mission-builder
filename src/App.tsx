import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

import MapComponent from './components/Map'
import { Tab, TabGroup } from './components/Tabs'

function App() {
  const [count, setCount] = useState(0)

  return (

    <div className="App">
      <MapComponent />
      <TabGroup activeTab="Tab 1" setActiveTab={() => {}}>
        <Tab text="Tab 1" />
        <Tab text="Tab 2" />
        <Tab text="Tab 3" />
      </TabGroup>
    </div>

  )
}

export default App
