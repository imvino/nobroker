import { useEffect, useState,useCallback } from 'react';
import Map, { Marker, NavigationControl, Popup, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { point, circle } from '@turf/turf';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoid2VicGlzdG9sIiwiYSI6ImNrNGFtcGxlajAzdWwzcnFmbDhmYW8ya3AifQ.2CrmPWAPePYQbN9JqalaSQ';

// Office coordinates
const OFFICE_LAT = 13.0825281;
const OFFICE_LNG = 80.2131445;

// Metro stations
const metroStations =[
    { "name": "Wimco Nagar depot",latitude: 13.1839089, longitude: 80.3090944, "lineColor": "red" },
    { "name": "Wimco Nagar", latitude: 13.1792804, longitude: 80.3073398, "lineColor": "red" },
    { "name": "kaladipet", latitude: 13.1505483, longitude: 80.2994025, "lineColor": "red" },
    { "name": "tt", latitude: 13.1601868, longitude: 80.3024406, "lineColor": "red" },
    { "name": "tolgate", latitude: 13.1431016, longitude: 80.2963683, "lineColor": "red" },
    { "name": "Thiruvottiyur", latitude: 13.1717903, longitude: 80.3052827, "lineColor": "red" },
    { "name": "New washermanpet",latitude: 13.1344440, longitude: 80.2930250, "lineColor": "red" },
    { "name": "Tondiarpet",latitude: 13.1246283, longitude: 80.2888121, "lineColor": "red" },
    { "name": "STC",latitude: 13.1157089, longitude: 80.2847040, "lineColor": "red" },
    { "name": "Washermanpet",latitude: 13.1087205, longitude: 80.2819920, "lineColor": "red" },
    { "name": "Mannadi", latitude: 13.0952931, longitude: 80.2862029, "lineColor": "orange" },
    { "name": "High Court", latitude: 13.0872007, longitude: 80.2849810, "lineColor": "orange" },
    { "name": "Chennai Central", latitude: 13.0824112, longitude: 80.2759651, "lineColor": "orange" },
    { "name": "Government Estate", latitude: 13.0696074, longitude: 80.2729768, "lineColor": "orange" },
    { "name": "LIC", latitude: 13.0643882, longitude: 80.2657187, "lineColor": "orange" },
    { "name": "Thousand Lights",latitude: 13.0585101, longitude: 80.2587601, "lineColor": "orange" },
    { "name": "ag/dms", latitude: 13.0458135, longitude: 80.2481997, "lineColor": "orange" },
    { "name": "Teynampet", latitude: 13.0368331, longitude: 80.2465412, "lineColor": "orange" },
    { "name": "Nandanam", latitude: 13.0317041, longitude: 80.2412423, "lineColor": "orange" },

    { "name": "Saidapet", latitude: 13.0239835, longitude: 80.2280812, "lineColor": "orange" },
    { "name": "Little Mount", latitude: 13.0146575, longitude: 80.2241584, "lineColor": "orange" },
    { "name": "Guindy", latitude: 13.0092521, longitude: 80.2131033, "lineColor": "orange" },
    { "name": "Alandur", latitude: 13.0042443, longitude: 80.2014280, "lineColor": "orange" },
    { "name": "Meenambakkam", latitude: 12.9875661, longitude: 80.1764421, "lineColor": "orange" },
    { "name": "Chennai Airport", latitude: 12.9807893, longitude: 80.1642018, "lineColor": "orange" },


    { "name": "St. Thomas Mount", latitude: 12.9953594, longitude: 80.1997066, "lineColor": "blue" },
    { "name": "Ekkattuthangal", latitude: 13.0168960, longitude: 80.2054160, "lineColor": "blue" },
    { "name": "Ashok Nagar KK Nagar", latitude: 13.0354697, longitude: 80.2110736, "lineColor": "blue" },
    { "name": "Vadapalani", latitude: 13.0509241, longitude: 80.2120377, "lineColor": "blue" },
    { "name": "Arumbakkam",latitude: 13.0616742, longitude: 80.2116241, "lineColor": "blue" },
    { "name": "CMBT", latitude: 13.0685546, longitude: 80.2039456, "lineColor": "blue" },
    { "name": "Koyambedu", latitude: 13.0734162, longitude: 80.1948267, "lineColor": "blue" },
    { "name": "Thirumangalam", latitude: 13.0852455, longitude: 80.2015489, "lineColor": "blue" },
    { "name": "Anna Nagar Tower", latitude: 13.0849711, longitude: 80.2088385, "lineColor": "blue" },
    { "name": "Anna Nagar East", latitude: 13.0845442, longitude: 80.2196589, "lineColor": "blue" },
    { "name": "Shenoy Nagar", latitude: 13.0787531, longitude: 80.2252525, "lineColor": "blue" },
    { "name": "Pachaiyappa's College", latitude: 13.0755951, longitude: 80.2328141, "lineColor": "blue" },
    { "name": "Kilpauk Medical College", latitude: 13.0776447, longitude: 80.2426295,"lineColor": "blue" },
    { "name": "Nehru Park", latitude: 13.0787187, longitude: 80.2504458, "lineColor": "blue" },
    { "name": "Egmore", latitude: 13.0802532, longitude: 80.2630223, "lineColor": "blue" }
];

const MapboxNobrokerMap = () => {
    const [viewState, setViewState] = useState({
        longitude: 80.2105642,
        latitude: 13.0825281,
        zoom: 11
    });
    const [allProperties, setAllProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedMetroStation, setSelectedMetroStation] = useState(null);
    const [error, setError] = useState(null);

    // Filter states
    const [transitScore, setTransitScore] = useState(7);
    const [lifestyleScore, setLifestyleScore] = useState(7);
    const [bathrooms, setBathrooms] = useState(2);
    const [minPropertySize, setMinPropertySize] = useState(950);
    const [useTransitFilter, setUseTransitFilter] = useState(false);
    const [useLifestyleFilter, setUseLifestyleFilter] = useState(false);
    const [maxTotalCost, setMaxTotalCost] = useState(18000);

    const handleMapClick = useCallback((event) => {
        const { lngLat } = event;
        console.log(`latitude: ${lngLat.lat.toFixed(7)}, longitude: ${lngLat.lng.toFixed(7)}`);
    }, []);

    useEffect(() => {
        const fetchAllProperties = async () => {
            const allFetchedProperties = [];
            setError(null);

            // for (let bhk = 1; bhk <= 3; bhk++) {
            //     for (let rent = 10000; rent <= 25000; rent += 1000) {
            //             // Fetch API data
            //             console.log(`/nobroker_api_data2/BHK${bhk}_rent_${rent - 1000}_${rent}.json`)
            //             const apiResponse = await axios.get(`/nobroker_api_data2/BHK${bhk}_rent_${rent - 1000}_${rent}.json`);
            //             const apiData = apiResponse.data;
            //             if (apiData && apiData.data) {
            //                 allFetchedProperties.push(...apiData.data);
            //             }
            //         }
            //     }

            for (let bhk = 1; bhk <= 3; bhk++) {
                for (let rent = 10000; rent <= 25000; rent += 1000) {
                    try {
                        // Fetch API data
                        const apiResponse = await axios.get(`/nobroker_api_data/BHK${bhk}_rent_${rent}.json`);
                        const apiData = apiResponse.data;
                        if (apiData && apiData.data) {
                            allFetchedProperties.push(...apiData.data);
                        }

                        // Fetch map data
                        // const mapResponse = await axios.get(`/nobroker_map_data/BHK${bhk}_rent_${rent}.json`);
                        // const mapData = mapResponse.data;
                        // if (mapData && mapData.data) {
                        //     if (mapData.data.outside && mapData.data.outside.properties) {
                        //         allFetchedProperties.push(...mapData.data.outside.properties);
                        //     } else if (mapData.data.inside && mapData.data.inside.properties) {
                        //         allFetchedProperties.push(...mapData.data.inside.properties);
                        //     }
                        // }
                    } catch (error) {
                        console.error(`Error fetching properties for BHK${bhk}, rent ${rent}:`, error);
                        // Continue with the next file even if one fails
                    }
                }
            }

            if (allFetchedProperties.length === 0) {
                setError('No properties found in any of the files');
            } else {
                console.log(`Total properties before deduplication: ${allFetchedProperties.length}`);

                // Remove duplicates
                const uniqueProperties = [];
                const seenIds = new Set();
                let duplicatesCount = 0;

                for (const property of allFetchedProperties) {
                    if (!seenIds.has(property.id)) {
                        uniqueProperties.push(property);
                        seenIds.add(property.id);
                    } else {
                        duplicatesCount++;
                    }
                }

                console.log(`Duplicates found and removed: ${duplicatesCount}`);
                console.log(`Total unique properties: ${uniqueProperties.length}`);

                setAllProperties(uniqueProperties);
            }
        };

        fetchAllProperties();
    }, []);

    useEffect(() => {
        if (allProperties.length > 0) {
            console.log(JSON.stringify(allProperties.map(v=>v.address)),'allProperties')
            const filtered = allProperties?.filter(property => {
                const totalCost = (parseInt(property.formattedPrice.replace(/,/g, '')) || 0) +
                    (parseInt(property.formattedMaintenanceAmount?.replace(/,/g, '')) || 0);
                return property.bathroom >= bathrooms &&
                    property.propertySize >= minPropertySize &&
                    (!useTransitFilter || (property.score?.transit && property.score.transit >= transitScore)) &&
                    (!useLifestyleFilter || (property.score?.lifestyle && property.score.lifestyle >= lifestyleScore)) &&
                    totalCost <= maxTotalCost;
            });
            // console.log(filtered.map(v=>v.address),'filtered')
            setFilteredProperties(filtered);
        }
    }, [allProperties, bathrooms, minPropertySize, transitScore, lifestyleScore, useTransitFilter, useLifestyleFilter, maxTotalCost]);

    const getGoogleMapsUrl = (lat, lng) => {
        return `https://www.google.com/maps/dir/?api=1&origin=${OFFICE_LAT},${OFFICE_LNG}&destination=${lat},${lng}`;
    };

    const generateCircle = (center, radiusKm) => {
        return circle(point(center), radiusKm, { steps: 64, units: 'kilometers' });
    };


    // Generate GeoJSON for metro station circles
    const metroCircles = {
        type: 'FeatureCollection',
        features: metroStations.map(station =>
            generateCircle([station.longitude, station.latitude], 1)
        )
    };

    // Generate GeoJSON for office radius
    const officeRadius = generateCircle([OFFICE_LNG, OFFICE_LAT], 8);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // Distance in km
        return d.toFixed(2);
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI/180)
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', backgroundColor: '#000', color: 'white' }}>
                <p>Number of filtered properties: {filteredProperties.length}/{allProperties.length}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={useTransitFilter}
                            onChange={(e) => setUseTransitFilter(e.target.checked)}
                        />
                        Use Transit Score Filter
                    </label>
                    {useTransitFilter && (
                        <label>
                            Min Transit Score:
                            <input
                                type='number'
                                value={transitScore}
                                onChange={(e) => setTransitScore(Number(e.target.value))}
                                min='0'
                                max='10'
                            />
                        </label>
                    )}
                    <label>
                        <input
                            type="checkbox"
                            checked={useLifestyleFilter}
                            onChange={(e) => setUseLifestyleFilter(e.target.checked)}
                        />
                        Use Lifestyle Score Filter
                    </label>
                    {useLifestyleFilter && (
                        <label>
                            Min Lifestyle Score:
                            <input
                                type='number'
                                value={lifestyleScore}
                                onChange={(e) => setLifestyleScore(Number(e.target.value))}
                                min='0'
                                max='10'
                            />
                        </label>
                    )}
                    <label>
                         Bathrooms:
                        <input
                            type='number'
                            value={bathrooms}
                            onChange={(e) => setBathrooms(Number(e.target.value))}
                            min='1'
                        />
                    </label>
                    <label>
                        Min Property Size:
                        <input
                            type='number'
                            value={minPropertySize}
                            onChange={(e) => setMinPropertySize(Number(e.target.value))}
                            min='0'
                        />
                    </label>
                    <label>
                        Max Total Cost:
                        <input
                            type='number'
                            value={maxTotalCost}
                            onChange={(e) => setMaxTotalCost(Number(e.target.value))}
                            min='0'
                        />
                    </label>
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    onClick={handleMapClick}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle='mapbox://styles/mapbox/streets-v11'
                    mapboxAccessToken={MAPBOX_TOKEN}
                >
                    <NavigationControl position='top-right'/>

                    {/* Office Marker */}
                    <Marker
                        longitude={OFFICE_LNG}
                        latitude={OFFICE_LAT}
                        anchor='bottom'
                    >
                        <div style={{
                            backgroundColor: 'blue',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }}/>
                    </Marker>

                    {/* Property Markers */}
                    {filteredProperties.map((property) => (
                        <Marker
                            key={property.id}
                            longitude={parseFloat(property.longitude)}
                            latitude={parseFloat(property.latitude)}
                            anchor='bottom'
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                setSelectedProperty(property);
                            }}
                        >
                            <div style={{
                                backgroundColor: 'red',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                cursor: 'pointer'
                            }}/>
                        </Marker>
                    ))}

                    {/* Metro Station Markers */}
                    {metroStations.map((station, index) => (
                        <Marker
                            key={index}
                            longitude={station.longitude}
                            latitude={station.latitude}
                            anchor='bottom'
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                setSelectedMetroStation(station);
                            }}
                        >
                            <div style={{
                                backgroundColor: 'green',
                                width: '15px',
                                height: '15px',
                                borderRadius: '50%',
                                cursor: 'pointer'
                            }}/>
                        </Marker>
                    ))}

                    {/* Office 10km Radius Circle */}
                    <Source id="office-radius" type="geojson" data={officeRadius}>
                        <Layer
                            id="office-radius-layer"
                            type="fill"
                            paint={{
                                'fill-color': 'rgba(0, 0, 255, 0.1)',
                                'fill-outline-color': 'blue'
                            }}
                        />
                    </Source>

                    {/* Metro Station Circles */}
                    <Source id="metro-circles" type="geojson" data={metroCircles}>
                        <Layer
                            id="metro-circle-layer"
                            type="fill"
                            paint={{
                                'fill-color': 'rgba(0, 255, 0, 0.1)',
                                'fill-outline-color': 'green'
                            }}
                        />
                    </Source>

                    {/* Property Popup */}
                    {selectedProperty && (
                        <Popup
                            longitude={parseFloat(selectedProperty.longitude)}
                            latitude={parseFloat(selectedProperty.latitude)}
                            anchor='top'
                            onClose={() => setSelectedProperty(null)}
                            maxWidth="none"
                        >
                            <div style={{ display: 'flex', width: '500px', padding: '10px' }}>
                                <div style={{ flex: '0 0 200px', marginRight: '20px' }}>
                                    {selectedProperty.photos && selectedProperty.photos[0] && (
                                        <img
                                            src={`https://assets.nobroker.in/images/${selectedProperty.id}/${selectedProperty.photos[0].imagesMap.thumbnail}`}
                                            alt={selectedProperty.propertyTitle}
                                            style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
                                        />
                                    )}
                                    <a
                                        href={getGoogleMapsUrl(selectedProperty.latitude, selectedProperty.longitude)}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        style={{ display: 'block', textAlign: 'center', marginBottom: '10px' }}
                                    >
                                        Get Directions
                                    </a>
                                    <a
                                        href={`https://www.nobroker.in${selectedProperty.detailUrl}`}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        style={{ display: 'block', textAlign: 'center' }}
                                    >
                                        View Details
                                    </a>
                                </div>
                                <div style={{ flex: '1' }}>
                                    <h3 style={{ margin: '0 0 10px 0' }}>{selectedProperty.propertyTitle}</h3>
                                    <p>Rent: ₹{selectedProperty.formattedPrice}</p>
                                    <p>Type: {selectedProperty.typeDesc}</p>
                                    <p>Locality: {selectedProperty.locality}</p>
                                    <p>Bathrooms: {selectedProperty.bathroom}</p>
                                    <p>Size: {selectedProperty.propertySize} sq ft</p>
                                    <p>Transit Score: {selectedProperty.score?.transit}</p>
                                    <p>Lifestyle Score: {selectedProperty.score?.lifestyle}</p>
                                    <p>Maintenance: ₹{selectedProperty.formattedMaintenanceAmount}</p>
                                    <p>Distance from
                                        Office: {calculateDistance(OFFICE_LAT, OFFICE_LNG, selectedProperty.latitude, selectedProperty.longitude)} km</p>
                                </div>
                            </div>
                        </Popup>
                    )}

                    {/* Metro Station Popup */}
                    {selectedMetroStation && (
                        <Popup
                            longitude={selectedMetroStation.longitude}
                            latitude={selectedMetroStation.latitude}
                            anchor='top'
                            onClose={() => setSelectedMetroStation(null)}
                        >
                            <div>
                                <h3>{selectedMetroStation.name}</h3>
                                <p>Latitude: {selectedMetroStation.latitude}</p>
                                <p>Longitude: {selectedMetroStation.longitude}</p>
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>
        </div>
    );
};

export default MapboxNobrokerMap;