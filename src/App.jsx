import React, {useState} from "react";

import './App.css';
import { Icon } from "leaflet";

import Map from "./components/Map";
import Tabs from "./components/Tabs";
import location_data from "./data/location";

function App() {


	const [location, setLocation] = useState("wkshp");
	const [mode, setMode] = useState("waypt");

	console.log(location)

	return (
		<div className="App">
			<Map center={location_data[location].center} zoom={location_data[location].zoom} />
			<Tabs tabs={["WAYPT", "CVRG", "BNDRY", "AIRDRP", "LAND"]} 
				top={58} left={1600}
				handleClick={setMode}
			/>
			<Tabs tabs={location_data.names} 
				top={130} left={1855}
				handleClick={setLocation}
			/>
		</div>
	);
}

export default App;