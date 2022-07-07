import "./App.css";
import {
    GoogleMap,
    LoadScript,
    Marker,
    StandaloneSearchBox,
} from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";

import {
    addDoc,
    collection,
    orderBy,
    getDocs,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { firestore } from "./index";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const libraries = ["places"];

const position = {
    lat: -27.590824,
    lng: -48.551262,
};

function App() {
    const [searchBox, setSearchBox] = useState();
    const [map, setMap] = useState();
    const [point, setPoint] = useState();

    const [name, setName] = useState("");
    const [date, setDate] = useState(new Date());

    const [initialLoading, setInitialLoading] = useState(true);
    const [updateEvents, setUpdateEvents] = useState(true);
    const [events, setEvents] = useState();

    const eventsRef = collection(firestore, "events");

    const getEvents = useCallback(() => {
        console.log("getEvents");
        if (updateEvents) {
            console.log("getEvents2");
            setUpdateEvents(false);
            const dt = new Date();
            dt.setDate(dt.getDate() - 1);
            console.log(dt.toISOString());
            const q = query(
                eventsRef,
                where("date", ">", dt),
                orderBy("date", "asc")
            );
            getDocs(q)
                .then((docs) => {
                    console.log(docs);
                    setEvents(docs);
                })
                .catch((err) => console.log(err))
                .finally(() => console.log("get docs done."));
        }
    }, [eventsRef, updateEvents]);

    const doGetEvents = useCallback(() => {
        setUpdateEvents(true);
        getEvents();
    }, [getEvents]);

    useEffect(() => {
        if (initialLoading) {
            setInitialLoading(false);
            doGetEvents();
        }
    }, [doGetEvents, initialLoading]);

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

    const saveEvent = (e) => {
        e.preventDefault();
        const newEvent = {
            name,
            date,
            location: point,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        setName("");
        setDate(new Date());
        addDoc(eventsRef, newEvent)
            .then(() => {
                console.log("document created");
            })
            .catch((err) => console.log(err));
    };

    return (
        <div className="map">
            <LoadScript
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                libraries={libraries}
            >
                <GoogleMap
                    onLoad={(ref) => setMap(ref)}
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={position}
                    zoom={15}
                >
                    <div className="address">
                        <form onSubmit={saveEvent}>
                            <StandaloneSearchBox
                                onLoad={(ref) => setSearchBox(ref)}
                                onPlacesChanged={onPlacesChanged}
                            >
                                <input
                                    className="addressField"
                                    placeholder="Type the address here."
                                />
                            </StandaloneSearchBox>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <DatePicker
                                selected={date}
                                onChange={(date) => setDate(date)}
                            />
                            <button type="submit">Save</button>
                        </form>
                        <div style={{ fontSize: 10, marginTop: 16 }}>
                            {events?.docs?.map((doc) => {
                                const event = doc.data();
                                return (
                                    <div
                                        key={doc.id}
                                        style={{ marginBottom: 10 }}
                                    >
                                        <div>
                                            <strong>Name:</strong> {event.name}
                                        </div>
                                        <div>
                                            <strong>Date:</strong>{" "}
                                            {event.date.toDate().toISOString()}
                                        </div>
                                        <div>
                                            <strong>Location:</strong> lat(
                                            {event.location.lat}), lng(
                                            {event.location.lng})
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {point && <Marker position={point} />}
                </GoogleMap>
            </LoadScript>
        </div>
    );
}

export default App;
