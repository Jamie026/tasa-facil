import * as ubicacion from "./map.js";
import * as viabilidad from "./viabilidad.js";

async function actualizarUbicacion(distrito, direccion) {
    const direccionCompleta = distrito + ' ' + direccion;
    try {
        alertify.notify('Actualizando ubicación...', 'warning', 5);
        const coordenada = await ubicacion.obtenerCoordenada(direccionCompleta);
        const distritoFormateado = distrito.replace(/\b\w/g, char => char.toUpperCase()).replace(/\s+/g, '_');
        const segmentos = await ubicacion.obtenerSegmentos(distritoFormateado);
        const segmentosFormateados = Object.values(segmentos).map(segmento => segmento.S);

        let numSegmento = 0;
        let encontrado = false;

        segmentosFormateados.forEach((segmento, index) => {
            if(encontrado) return;
            if(ubicacion.perteneceSegmento({ latitud: coordenada.latitud, longitud: coordenada.longitud }, segmento)) {
                numSegmento = index + 1;
                encontrado = true;
            }
        });

        document.getElementById('segmento').value = numSegmento;
        ubicacion.mostrarMapa(coordenada.latitud, coordenada.longitud, document.getElementById('mapa'));
        document.getElementById('ubicacionInput').value = direccionCompleta;
        alertify.notify('Ubicación Actualizada', 'success', 5);
    } catch (error) {
        console.error(error);
        alertify.error('Error al actualizar ubicación. Sea más preciso con los datos');
    }
}

function clickUbicar() {
    document.getElementById('ubicar').addEventListener('click', async (e) => {
        e.preventDefault();
        const distrito = document.getElementById('distrito').value;
        const direccion = document.getElementById('direccion').value;
        (!distrito || !direccion) ? alertify.error('Indique el distrito y la dirección') : await actualizarUbicacion(distrito, direccion);
    });
}

function inputFormRanges() {
    let ranges = document.querySelectorAll('.inputRange');
    console.log(ranges);
    Array.from(ranges).forEach(range => {
        console.log(range);
        let field = range.previousElementSibling;
        console.log(field);
        range.addEventListener('input', (e) => field.value = e.target.value);
        field.addEventListener('input', (e) => range.value = e.target.value);
    });
}

function validarFormularios() {
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', e => {
            if(!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

async function inicializarMapa(callback) {
    try {
        const coordenada = await ubicacion.obtenerCoordenada('Los Portales Santa Rosa');
        ubicacion.mostrarMapa(coordenada.latitud, coordenada.longitud, document.getElementById('mapa'));
        callback();
    } catch (error) {
        console.error(error);
    }
}

function whatsappLink(elementLink) {
    let adminTelefono = elementLink.getAttribute('data-adminTelefono');
    let whatsappWebUrl = 'https://web.whatsapp.com/send?phone=' + adminTelefono;
    let appUrl = 'https://wa.me/' + adminTelefono;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    elementLink.href = isMobile ? appUrl : whatsappWebUrl;
}

window.onload = async () => {
    validarFormularios();
    inputFormRanges();
    const botonUbicar = document.getElementById('ubicar');
    botonUbicar && await inicializarMapa(clickUbicar);

    const responseEvaluacion = document.getElementById('dataEvaluacion');
    responseEvaluacion && (() => {
        const dataEvaluacion = JSON.parse(responseEvaluacion.value);
        responseEvaluacion.value = '';
        viabilidad.checkViabilidad('resumen', dataEvaluacion);
        whatsappLink(document.getElementById('botonWhatsapp'));
    })();
}