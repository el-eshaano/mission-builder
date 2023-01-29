import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon, LatLng } from 'leaflet'

import 'leaflet/dist/leaflet.css'
// import '../../public/css/Map.css'

const icon = new Icon({
    iconUrl: '/marker.svg',
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5],
})

const MapComponent = () => {
    const position: LatLng = new LatLng(13.347674039927663, 74.79216992855073)

    return (
        <MapContainer 
            center={position}
            zoom={20} 
            scrollWheelZoom={true}
            style={{ 
                height: '100vh', 
                width: '100vw',
                margin: 0, 
            }}
        >
            <TileLayer
                url='http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                maxZoom={20}
            />
        </MapContainer>
    )
}

export default MapComponent