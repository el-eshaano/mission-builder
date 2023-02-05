//  ██████╗ ██╗      ██████╗ ██████╗  █████╗ ██╗     ███████╗
// ██╔════╝ ██║     ██╔═══██╗██╔══██╗██╔══██╗██║     ██╔════╝
// ██║  ███╗██║     ██║   ██║██████╔╝███████║██║     ███████╗
// ██║   ██║██║     ██║   ██║██╔══██╗██╔══██║██║     ╚════██║
// ╚██████╔╝███████╗╚██████╔╝██████╔╝██║  ██║███████╗███████║
//  ╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝

let mapOptions = {
    center:[13.347674039927663, 74.79216992855073],
    zoom: 18
}
let map = new L.map('map' , mapOptions);

let googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});
map.addLayer(googleSat);


                        
//  ██████╗██╗      █████╗ ███████╗███████╗███████╗███████╗
// ██╔════╝██║     ██╔══██╗██╔════╝██╔════╝██╔════╝██╔════╝
// ██║     ██║     ███████║███████╗███████╗█████╗  ███████╗
// ██║     ██║     ██╔══██║╚════██║╚════██║██╔══╝  ╚════██║
// ╚██████╗███████╗██║  ██║███████║███████║███████╗███████║
//  ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝
                                                        
class LatLon {
  constructor(lat, lon) {
    this.lat = lat;
    this.lon = lon;
  }

  asArray() {
    return [this.lat, this.lon];
  }
}

class MapPoint extends LatLon {
    constructor(mode, lat, lon, alt) {

        super(lat, lon);
        this.mode = mode;
        if(alt !== undefined) this.alt = alt;
        this.marker = L.marker([lat, lon], {icon: mode.icon, title: mode.getTitle(), draggable: true});
        this.marker
            .bindPopup(this.getNewPopupContent(), {className: 'popup'})
            .addEventListener('movestart', this.onMoveBegin.bind(this))
            .addEventListener('moveend', this.onMoveEnd.bind(this))
            .addEventListener('drag', this.onDrag.bind(this))
            .addEventListener('mouseover', () => {
                this.marker.openPopup();
            })
            .addEventListener('mouseout', () => {
                this.marker.closePopup();
            })
            .on('wheel', this.onScroll.bind(this))
            .addTo(map);

        // Create a div child to the marker with class 'marker-child'
        let marker_child = document.createElement('div');
        marker_child.className = 'marker-child';
        this.marker._icon.appendChild(marker_child);

        // Add event listener for mousewheel
        this.marker._icon.addEventListener('mousewheel', this.onScroll.bind(this));

    }

    updatePopupContent() {
        let content = this.marker.getPopup().getContent();
        let title = content.split('<br>')[0];
        let new_coords = `${this.displayCoords()}`;
        if (this.mode.name === 'Waypoint') {
            new_coords += `, ${this.alt}`;
        }
        let new_content = `${title} <br> ${new_coords}`;
        return new_content;
    }

    getNewPopupContent() {

        let content = `${this.mode.getTitle()} <br> ${this.displayCoords()}`;

        if (this.mode.name === 'Waypoint') {
            content += `, ${this.alt}`;
        }

        return content;
    }

    onMoveBegin() {
        // Show popup
        this.marker.openPopup();
    }

    onDrag() {
        this.lat = this.marker.getLatLng().lat;
        this.lon = this.marker.getLatLng().lng;
        this.marker.setPopupContent(this.updatePopupContent());
        this.mode.renderPoints();
    }


    onMoveEnd() {

        console.log('move end');

        // Update coordinates
        this.lat = this.marker.getLatLng().lat;
        this.lon = this.marker.getLatLng().lng;
        this.marker.setPopupContent(this.updatePopupContent());
        this.mode.renderPoints();

        this.marker.closePopup();
    }

    onScroll(e) {

        // only continue if the mode is waypoint
        if (this.mode.name !== 'Waypoint') return;

        console.log('scroll');

        e.preventDefault();
        e.stopPropagation();
        let delta = e.deltaY;
        if (delta > 0) {
            this.alt += 2;
        }
        else {
            this.alt -= 2;
        }
        this.marker.setPopupContent(this.updatePopupContent());
        // Make the marker icon bigger with altitude
        let new_icon = L.icon({
            iconUrl: this.mode.icon.options.iconUrl,
            iconSize: [25 + (this.alt-90)/5, 25 + (this.alt-90)/5],
            iconAnchor: [12.5 + (this.alt-90)/10, 12.5 + (this.alt-90)/10],
            popupAnchor: [0, -25 - (this.alt-90)/5]
        });
        this.marker.setIcon(new_icon);
    }

    displayCoords() {
        return `${this.lat.toFixed(6)}, ${this.lon.toFixed(6)}`;
    }

    asArray() {
        if(this.alt !== undefined) return [this.lat, this.lon, this.alt];
        else return [this.lat, this.lon];
    }
}

class Mode {
    
    constructor(name, icon_path, multiple=true, join=false, fill=false, colour='red') {
        this.name = name;
        this.icon = L.icon({
            iconUrl: icon_path,
            iconSize: [25,25],
            iconAnchor: [12.5, 12.5],
            popupAnchor: [0, -25]
        });
        
        this.multiple = multiple;
        if (multiple) {
            this.points = [];
            this.idx = 1;
        }
        this.join = join;
        this.fill = fill;
        this.colour = colour;
        this.render = undefined;
    }

    getTitle() {
        if(this.multiple) return `${this.name} ${this.idx}`;
        else return this.name;
    }

    addPoint(lat, lon, alt) {

        if(!this.multiple) {

            // Remove old point
            if (this.points !== undefined) {
                map.removeLayer(this.points.marker);
                this.points = undefined;
            }

            // If single point, replace it
            this.points = new MapPoint(this, lat, lon, alt);
        }
        else {
            // If multiple points, add a new point
            this.points.push(new MapPoint(this, lat, lon, alt));
            this.idx++;
        }


    }

    renderPoints() {

        // If render already exists, remove it
        if (this.render !== undefined) {
            map.removeLayer(this.render);
            this.render = undefined;
        }
        
        // If multiple points, render as a polyline or polygon depending on fill
        if(this.fill) {
            let coords = [];
            for (let point of this.points) coords.push(point.asArray());
            this.render = L.polygon(coords, {color: this.colour})
            this.render.addTo(map);
        }
        else if(this.join) {
            let coords = [];
            for (let point of this.points) coords.push(point.asArray());
            this.render = L.polyline(coords, {color: this.colour})
            this.render.addTo(map);
        }
    }

    clear() {

        if (this.points === undefined) return;

        if (this.render !== undefined) {
            map.removeLayer(this.render);
            this.render = undefined;
        }
        
        // Remove all markers
        if(this.multiple) for (let point of this.points) map.removeLayer(point.marker);
        else map.removeLayer(this.points.marker);

        if(this.multiple){
            this.points = [];
            this.idx = 1;
        }
        else this.points = undefined;
    }

    undo() {
        if(this.points === undefined) return;
        if(this.multiple) {
            map.removeLayer(this.points.pop().marker);
            this.idx--;
        }
        else {
            map.removeLayer(this.points.marker);
            this.points = undefined;
        }

        this.renderPoints();
    }

    asArray() {
        if(this.multiple) {
            let coords = [];
            for (let point of this.points) coords.push(point.asArray());
            return coords;
        }
        else if(this.points != undefined) return this.points.asArray();
    }
}

let modes = {
    'waypt': new Mode('Waypoint', 'assets/waypt.png', multiple=true, join=true, fill=false, colour='#6b7fd7'),
    'boundary': new Mode('Boundary', 'assets/boundary.png', multiple=true, join=true, fill=true, colour='#0b032d'),
    'coverage': new Mode('Coverage', 'assets/coverage.png', multiple=true, join=true, fill=true, colour='#f6bd60'),
    'airdrop': new Mode('Airdrop', 'assets/airdrop.png', multiple=true, join=false, fill=false, colour='orange'),
    'land': new Mode('Land', 'assets/land.png', multiple=false, join=false, fill=false, colour='purple')
};

let currentMode = modes['waypt'];

map.on('click', (e) => {

    if (currentMode.name === 'Waypoint') currentMode.addPoint(e.latlng.lat, e.latlng.lng, 90);
    else currentMode.addPoint(e.latlng.lat, e.latlng.lng);
    currentMode.renderPoints();
});

let clearMap = () => {
    for (let mode of Object.values(modes)) {
        mode.clear();
    }
}

class Button {

    constructor(id){
        this.button = document.getElementById(id);
        this.button.addEventListener('click', this.onClick.bind(this));
    }

    onClick(){}
}

class LocationButton extends Button {

    constructor(id, coords, zoom) {
        super(id);
        this.coords = coords;
        this.zoom = zoom;
    }

    onClick() {
        clearMap();
        map.setView(this.coords, this.zoom);
    }
}

ws_button = new LocationButton('ws', coorsd=[13.347674039927663, 74.79216992855073], zoom=18);
ground_button = new LocationButton('ground', coords=[13.34320087873921, 74.79388117790224], zoom=17);
auvsi_button = new LocationButton('auvsi', coords=[38.31543061815121,-76.55054569244386], zoom=15);

class ActionButton extends Button {

    constructor(id, action) {
        super(id);
        this.action = action;
    }

    onClick() {
        this.action();
    }
}
let clear_button = new ActionButton('clear', clearMap);

let save_button = new ActionButton('save', () => {
    // let mission_name = document.getElementById('mission-name').value;
    let mission_name = prompt('Enter mission name');

    // if(mission_name == ''){
        // alert('Please enter a mission name');
        // return;
    // }

    let mission1 = {

        'land_position': modes['land'].asArray(),
        'amsl': 240,
        'air_drop_height': 340,
        'waypoints': modes['waypt'].asArray(),
        'fly_zone': {
            'minimum_altitude': 250,
            'maximum_altitude': 650,
            'boundary_points': modes['boundary'].asArray()
        },
        'search_zone': {
            'boundary_points': modes['coverage'].asArray()
        },
        'air_drop_positions': [],
        'obstacles' : []
    }
    let mission2 = {
        'land_position': modes['land'].asArray(),
        'amsl': 240,
        'air_drop_height': 340,
        'waypoints': [],
        'fly_zone': {
            'minimum_altitude': 250,
            'maximum_altitude': 650,
            'boundary_points': modes['boundary'].asArray()
        },
        'search_zone': {
            'boundary_points': []
        },
        'air_drop_positions': modes['airdrop'].asArray(),
        'obstacles': []
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
});

let mode_buttons = document.getElementsByClassName('mode-button');
for (let button of mode_buttons) {

    button.addEventListener('click', () => {
        currentMode = modes[button.id];
        console.log(currentMode);

        for(let button2 of mode_buttons){
            button2.classList.add('btn-outline');
        }
        button.classList.remove('btn-outline');
    });
}

// ctrl + z to undo
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        currentMode.undo();
    }
});