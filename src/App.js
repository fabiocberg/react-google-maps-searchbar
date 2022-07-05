import logo from "./logo.svg";
import "./App.css";
import {
    GoogleMap,
    LoadScript,
    Marker,
    StandaloneSearchBox,
} from "@react-google-maps/api";
import { useState } from "react";

const libraries = ["places"];

const position = {
    lat: -27.590824,
    lng: -48.551262,
};

function App() {
    const [searchBox, setSearchBox] = useState();
    const [map, setMap] = useState();
    const [point, setPoint] = useState();

    const onPlacesChanged = () => {
        const places = searchBox.getPlaces();
        const place = places[0];
        const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        };
        setPoint(location);
        console.log(place);
        console.log(location);
        map.panTo(location);
    };

    return (
        <div className="map">
            <LoadScript
                googleMapsApiKey="AIzaSyA-rzIIZK2SjyZqBTDaeO9Q16EGfceGnBw"
                libraries={libraries}
            >
                <GoogleMap
                    onLoad={(ref) => setMap(ref)}
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={position}
                    zoom={15}
                >
                    <div className="address">
                        <StandaloneSearchBox
                            onLoad={(ref) => setSearchBox(ref)}
                            onPlacesChanged={onPlacesChanged}
                        >
                            <input
                                className="addressField"
                                placeholder="Type the address here."
                            />
                        </StandaloneSearchBox>
                        {point && <Marker position={point} />}
                    </div>
                </GoogleMap>
            </LoadScript>
        </div>
    );
}

export default App;
