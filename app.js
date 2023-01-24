let mapOptions = {
    center:[13.347674039927663, 74.79216992855073],
    zoom: 18
}

let lat = '';
let lon = '';

let map = new L.map('map' , mapOptions);

let googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});
map.addLayer(googleSat);

let curr_waypt_idx = 0;

// Custom Waypoint Icons
let waypt_icon = L.icon({
    iconUrl: 'assets/waypt.png',
    iconSize: [25,25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -25]
});
let boundary_icon = L.icon({
    iconUrl: 'assets/boundary.png',
    iconSize: [25,25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -25]
});
let airdrop_icon = L.icon({
    iconUrl: 'assets/airdrop.png',
    iconSize: [25,25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -25]
});
let coverage_icon = L.icon({
    iconUrl: 'assets/coverage.png',
    iconSize: [25,25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -25]
});
let land_icon = L.icon({
    iconUrl: 'assets/land.png',
    iconSize: [25,25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -25]
});

let mode = 'waypt';

let points = {
    'waypt' : [],
    'boundary' : [],
    'coverage' : [],
    'airdrop' : [],
    'land': []
}
let icons = {
    'waypt' : waypt_icon,
    'boundary' : boundary_icon,
    'coverage' : coverage_icon,
    'airdrop' : airdrop_icon,
    'land': land_icon
}
markers = [];

renderLines = () => {
    // Remove previous lines
    map.eachLayer(layer => {
        if(layer instanceof L.Polygon){
            map.removeLayer(layer);
        }
        else if(layer instanceof L.Polyline){
            map.removeLayer(layer);
        }
    });

    // Render new lines
    let waypt_polyline = L.polyline(points['waypt'], {color: '#6b7fd7'}).addTo(map);
    let boundary_polygon = L.polygon(points['boundary'], {color: '#0b032d'}).addTo(map);
    let coverage_polygon = L.polygon(points['coverage'], {color: '#f6bd60'}).addTo(map);
    // map.fitBounds(polygon.getBounds());
}

let mode_index = {
    'waypt': 1,
    'boundary': 1,
    'airdrop': 1,
    'coverage': 1,
    'land': 1
}

map.on('click', (event) => {

    if (mode == 'land') {
        points[mode] = [event.latlng.lat, event.latlng.lng];
        // Move the marker if it already exists
        for(let i = 0; i < markers.length; i++){
            if(markers[i].options.title.includes('land')){
                markers[i].setLatLng([event.latlng.lat, event.latlng.lng]);
                markers[i].bindPopup(`
                    ${markers[i].options.title} , <br>
                    ${Math.round(event.latlng.lat * 1000000) / 1000000}, ${Math.round(event.latlng.lng * 1000000) / 1000000}
                `);
                return;
            }
        }
    }
    else{
        points[mode].push(mode == 'waypt' ? [event.latlng.lat, event.latlng.lng, 90] : [event.latlng.lat, event.latlng.lng]);
    }

    markers.push(
        L.marker(
            [event.latlng.lat , event.latlng.lng], 
            {
                icon: icons[mode],
                title: `${mode} ${mode_index[mode]}`,
                draggable: true
            },
        ).addTo(map)
        .bindPopup(`
            ${mode} ${mode == 'land' ? mode_index[mode] : mode_index[mode]++} , <br>
            ${Math.round(event.latlng.lat * 1000000) / 1000000}, ${Math.round(event.latlng.lng * 1000000) / 1000000}
        `, {closeOnClick: true, className: 'popup'})
        .addEventListener('move', (event) => {
            idx = event.target.options.title.split(' ')[1] - 1;
            if(event.target.options.title.includes('waypt')){
                points['waypt'][idx] = [event.latlng.lat, event.latlng.lng, points['waypt'][idx][2]];
                console.log(points['waypt'][idx])
            }
            else if(event.target.options.title.includes('boundary')){
                points['boundary'][idx] = [event.latlng.lat, event.latlng.lng];
            }
            else if(event.target.options.title.includes('airdrop')){
                points['airdrop'][idx] = [event.latlng.lat, event.latlng.lng];
            }
            else if(event.target.options.title.includes('coverage')){
                points['coverage'][idx] = [event.latlng.lat, event.latlng.lng];
            }
            else if(event.target.options.title.includes('land')){
                points['land'] = [event.latlng.lat, event.latlng.lng];
            }
            // Update the popup
            event.target.bindPopup(`
                ${event.target.options.title} , <br>
                ${Math.round(event.latlng.lat * 1000000) / 1000000}, ${Math.round(event.latlng.lng * 1000000) / 1000000}
            `);

            renderLines();
        })
        .addEventListener('click', (event) => {
            modifyPopups();
        })

    );
    renderLines();
    
    lat = event.latlng.lat;
    lon = event.latlng.lng;
})

let saveMission = () => {
    // let mission_name = document.getElementById('mission-name').value;
    let mission_name = prompt('Enter mission name');

    // if(mission_name == ''){
        // alert('Please enter a mission name');
        // return;
    // }

    let mission1 = {
        'land_position': points['land'],
        'amsl': 240,
        'air_drop_height': 340,
        'waypoints': points['waypt'],
        'fly_zone': {
            'minimum_altitude': 250,
            'maximum_altitude': 650,
            'boundary_points': points['boundary']
        },
        'search_zone': {
            'boundary_points': points['coverage']
        }
    }
    let mission2 = {
        'land_position': points['land'],
        'amsl': 240,
        'air_drop_height': 340,
        'waypoints': null,
        'fly_zone': {
            'minimum_altitude': 250,
            'maximum_altitude': 650,
            'boundary_points': points['boundary']
        },
        'search_zone': {
            'boundary_points': points['coverage']
        },
        'air_drop_positions': points['airdrop']
    }

    // Save both as YAML in the missions folder
    let mission1_yaml = jsyaml.dump(mission1);
    let mission2_yaml = jsyaml.dump(mission2);

    let mission1_file = new Blob([mission1_yaml], {type: 'text/plain'});
    let mission2_file = new Blob([mission2_yaml], {type: 'text/plain'});

    // save the file
    saveAs(mission1_file, `${mission_name}.yaml`);
    saveAs(mission2_file, `${mission_name}_airdrop.yaml`);


    clearMap();

    console.log("DONE!!");
}


let clearMap = () => {
    points = {
        'waypt': [],
        'boundary': [],
        'airdrop': [],
        'coverage': []
    }
    markers.forEach(marker => {
        map.removeLayer(marker);
    })
    markers = [];

    map.eachLayer(layer => {
        if(layer instanceof L.Polygon){
            map.removeLayer(layer);
        }
        if(layer instanceof L.Polyline){
            map.removeLayer(layer);
        }
    })

    mode_index = {
        'waypt': 1,
        'boundary': 1,
        'airdrop': 1,
        'coverage': 1
    }

    lat = '';
    lon = '';
}

// Button Clicks
for(let i = 0; i < 5; i++){
    document.getElementsByClassName('point')[i].addEventListener('click', () => {
        mode = document.getElementsByClassName('point')[i].id;
        console.log(mode);

        // Remove btn-outline class from this button and add to all the rest
        for(let j = 0; j < 5; j++){
            document.getElementsByClassName('point')[j].classList.remove('btn-outline');
            if(j != i){
                document.getElementsByClassName('point')[j].classList.add('btn-outline');
            }
        }

    })
}
document.getElementById('ws').addEventListener('click', () => {
    map.setView([13.347674039927663, 74.79216992855073], 18);
    clearMap();
})
document.getElementById('ground').addEventListener('click', () => {
    map.setView([13.34320087873921, 74.79388117790224], 17);
    clearMap();
})
document.getElementById('auvsi').addEventListener('click', () => {
    map.setView([38.31543061815121,-76.55054569244386], 15);
    clearMap();
})
document.getElementById('clear').addEventListener('click', clearMap);
document.getElementById('save').addEventListener('click', saveMission);

// on ctrl+z, remove last marker
document.addEventListener('keydown', (event) => {
    if(event.ctrlKey && event.key == 'z'){
        if(markers.length > 0){
            map.removeLayer(markers.pop());
            points[mode].pop();
            renderLines();
        }
    }
});

// Add an altitude input box to the popup

modifyPopups = () => {
    let popups = document.getElementsByClassName('popup');
    for(let i = 0; i < popups.length; i++){

        if(popups[i].innerHTML.includes('Altitude') || !popups[i].innerHTML.includes('waypt')){
            continue;
        }
        // Get marker title
        let title = popups[i].children[0].children[0].innerHTML.split(' ').filter((str) => str !== '').filter((str) => str !== '\n');
        let idx = title[1] - 1;
        let type = title[0];
        console.log("type: ", type, "idx: ", idx);
        popups[i].children[0].children[0].innerHTML += `
            <input type="number" class="alt-input" placeholder="${points[type][idx][2]}" />
        `;
    }

    let alt_inputs = document.getElementsByClassName('alt-input');
    for(let i = 0; i < alt_inputs.length; i++){
        alt_inputs[i].addEventListener('change', (event) => {
            let alt = parseInt(event.target.value);
            let title = event.target.parentElement.innerHTML.split(' ').filter((str) => str !== '').filter((str) => str !== '\n');
            let idx = title[1] - 1;
            console.log("title: ", title, "idx: ", idx)
            if(title.includes('waypt')){
                points['waypt'][idx][2] = alt;
            }
            console.log("CHANGE MADE");
            console.log(points['waypt']);
        })
    }
}