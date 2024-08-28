import { useEffect, useState,useCallback } from 'react';
import Map, { Marker, NavigationControl, Popup, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import { point, circle } from '@turf/turf';
import metroStations from './metro.js';


const MAPBOX_TOKEN = 'pk.eyJ1Ijoid2VicGlzdG9sIiwiYSI6ImNrNGFtcGxlajAzdWwzcnFmbDhmYW8ya3AifQ.2CrmPWAPePYQbN9JqalaSQ';

// Office coordinates
const OFFICE_LAT = 13.0825281;
const OFFICE_LNG = 80.2131445;

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
    const [searchTerm, setSearchTerm] = useState('');

    // Filter states
    const [transitScore, setTransitScore] = useState(7);
    const [lifestyleScore, setLifestyleScore] = useState(7);
    const [bathrooms, setBathrooms] = useState(2);
    const [bhk, setBhk] = useState(2);
    const [minPropertySize, setMinPropertySize] = useState(850);
    const [useTransitFilter, setUseTransitFilter] = useState(false);
    const [useLifestyleFilter, setUseLifestyleFilter] = useState(false);
    const [maxTotalCost, setMaxTotalCost] = useState(19000);

    const handleMapClick = useCallback((event) => {
        const { lngLat } = event;
        console.log(`latitude: ${lngLat.lat.toFixed(7)}, longitude: ${lngLat.lng.toFixed(7)}`);
    }, []);

    useEffect(() => {
        const fetchAllProperties = async () => {
            const allFetchedProperties = [];
            setError(null);

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
            const filtered = allProperties?.filter(property => {
                const totalCost = (parseInt(property.formattedPrice.replace(/,/g, '')) || 0) +
                    (parseInt(property.formattedMaintenanceAmount?.replace(/,/g, '')) || 0);
                return property.bathroom >= bathrooms &&
                    property.propertySize >= minPropertySize &&
                    property.type == 'BHK'+bhk &&
                    property.photos.length !=0 &&
                    (property.waterSupply === 'CORPORATION' ||  property.waterSupply === 'CORP_BORE') &&
                    (!useTransitFilter || (property.score?.transit && property.score.transit >= transitScore)) &&
                    (!useLifestyleFilter || (property.score?.lifestyle && property.score.lifestyle >= lifestyleScore)) &&
                    totalCost <= maxTotalCost;
            });
          // console.log(filtered.map(v=>v.photos),'filtered')
            setFilteredProperties(filtered);
        }
    }, [allProperties, bathrooms, minPropertySize,bhk, transitScore, lifestyleScore, useTransitFilter, useLifestyleFilter, maxTotalCost]);

    const getGoogleMapsUrl = (lat, lng) => {
        return `https://www.google.com/maps/dir/?api=1&origin=${OFFICE_LAT},${OFFICE_LNG}&destination=${lat},${lng}`;
    };

    const generateCircle = (center, radiusKm) => {
        return circle(point(center), radiusKm, { steps: 64, units: 'kilometers' });
    };


    // Generate GeoJSON for metro station circles
    const metroCircles = {
        type: 'FeatureCollection',
        features: metroStations().map(station =>
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

    const handlePropertyClick = (property) => {
        setSelectedProperty(property);
        setViewState({
            ...viewState,
            latitude: parseFloat(property.latitude),
            longitude: parseFloat(property.longitude),
            zoom: 14
        });
    };

    const filteredAndSearchedProperties = filteredProperties.filter(property =>
        property.secondaryTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={{ width: '98vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', backgroundColor: '#000', color: 'white' }}>
                <p>Number of filtered properties: {filteredProperties.length}/{allProperties.length}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label>
                        <input
                            type='checkbox'
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
                            type='checkbox'
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
                        BHK:
                        <input
                            type='number'
                            value={bhk}
                            onChange={(e) => setBhk(Number(e.target.value))}
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
                            step={1000}
                            value={maxTotalCost}
                            onChange={(e) => setMaxTotalCost(Number(e.target.value))}
                            min='15000'
                        />
                    </label>
                </div>
            </div>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div
                    style={{ width: '300px', height: '100%', overflowY: 'auto', backgroundColor: '#f0f0f0', padding: '10px' }}>
                    <input
                        type='text'
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
                    />
                    {filteredAndSearchedProperties.map((property) => (
                        <div
                            key={property.id}
                            onClick={() => handlePropertyClick(property)}
                            style={{
                                cursor: 'pointer',
                                padding: '5px',
                                marginBottom: '5px',
                                backgroundColor: selectedProperty?.id === property.id ? '#ddd' : '#000'
                            }}
                        >
                            {property.secondaryTitle}
                        </div>
                    ))}
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
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
                        {metroStations().map((station, index) => (
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
                        {selectedProperty && (<Popup
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
        </div>
    );
};

export default MapboxNobrokerMap;