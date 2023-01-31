import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const Map = (props) => {
    console.log(props)
    return (
        <MapContainer center={props.center} zoom={props.zoom} scrollWheelZoom={true}>
            <TileLayer
                url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                maxZoom={20}
            />
        </MapContainer>
    );
}

export default Map;