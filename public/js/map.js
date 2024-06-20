function perteneceSegmento(coordenadaDireccion, coordenadaSegmento) {
    const coordenadasArray = coordenadaSegmento.replace(/[()]/g, "").split(",");
    const coordenadas = [];

    for (let index = 0; index < coordenadasArray.length; index += 2) {
        const latitud = parseFloat(coordenadasArray[index]);
        const longitud = parseFloat(coordenadasArray[index + 1]);

        if (!isNaN(latitud) && !isNaN(longitud)) 
            coordenadas.push({ lat: latitud, lng: longitud });
    }

    const poligono = new google.maps.Polygon({ paths: coordenadas });
    const coordenadaManual = new google.maps.LatLng({
        lat: coordenadaDireccion.latitud,
        lng: coordenadaDireccion.longitud
    });
    return google.maps.geometry.poly.containsLocation(coordenadaManual, poligono);
}

async function obtenerCoordenada(direccion) {
    const direccionFormateada = encodeURIComponent(direccion);
    const url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + direccionFormateada + "&key=AIzaSyDhE3-DQ-SZ8_V86SccBiU1if7ACzBt7So";    

    try {
        const coordenadaResponse = await axios.get(url);
        const coordenadasData = coordenadaResponse.data;
        const ubicacion = coordenadasData.results[0].geometry.location;
        const latitud = ubicacion.lat;
        const longitud = ubicacion.lng;
        const nombre = coordenadasData.results[0].formatted_address;
        return { latitud: latitud, longitud: longitud, nombre: nombre };
    } catch (error) {
        console.error("Error en la solicitud a la API: ", error);
        throw error;
    }
}

function mostrarMapa(latitud, longitud, elementoMapa) {
    const coordenada = latitud + "," + longitud;
    const url = "https://maps.googleapis.com/maps/api/staticmap?center=" + coordenada + "&markers=" + coordenada + "&size=400x400&key=AIzaSyDhE3-DQ-SZ8_V86SccBiU1if7ACzBt7So";    

    let mapa = new google.maps.Map(elementoMapa, {
        center: { lat: latitud, lng: longitud },
        zoom: 15,
        disableDefaultUI: true
    });

    new google.maps.Marker({
        position: { lat: latitud, lng: longitud },
        map: mapa,
        title: "Ubicación"
    });

    return {
        map: mapa,    
        mapImageURL: url
    };
}

async function obtenerSegmentos(distrito) {
    try {
        const segmentosResponse = await axios.post("https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_segmentos", {
            nombre: distrito
        });
        return segmentosResponse.data.response.segmentos || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

export { obtenerCoordenada, mostrarMapa, perteneceSegmento, obtenerSegmentos };