import * as ubicacion from "./map.js";

function formatearTexto(texto) {
    return texto != "Breña" ? texto.replace(/\b\w/g, (char) => char.toUpperCase()).replace(/\s+/g, "_") : texto;
}

async function actualizarUbicacion(distrito, direccion) {
    const direccionCompleta = distrito + " " + direccion;
    try {
        alertify.notify("Actualizando ubicación...", "warning", 5);
        const coordenada = await ubicacion.obtenerCoordenada("Perú " + direccionCompleta);
        const segmentos = await ubicacion.obtenerSegmentos(formatearTexto(distrito));
        const segmentosFormateados = Object.values(segmentos).map((segmento) => segmento.M.coordenada.S);
        const mapaData = ubicacion.mostrarMapa(coordenada.latitud, coordenada.longitud, document.getElementById("mapa"));

        let numSegmento = 0;
        
        for (let index = 0; index < segmentosFormateados.length; index++) {
            const segmento = segmentosFormateados[index];
            if (!ubicacion.perteneceSegmento({ latitud: coordenada.latitud, longitud: coordenada.longitud }, segmento))
                numSegmento = index + 1;
            else 
                break;
        }

        document.getElementById("imageMapa").value = mapaData.mapImageURL;
        document.getElementById("segmento").value = numSegmento;
        document.getElementById("ubicacionInput").value = coordenada.nombre;
        alertify.notify("Ubicación Actualizada", "success", 5);
    } catch (error) {
        console.error(error);
        alertify.error("Error al actualizar ubicación. Sea más preciso con los datos");
    }
}

function clickUbicar() {
    document.getElementById("ubicar").addEventListener("click", async (e) => {
        e.preventDefault();
        const distrito = document.getElementById("distrito").value;
        const direccion = document.getElementById("direccion").value;
        (!distrito || !direccion) ? alertify.error("Indique el distrito y la dirección") : await actualizarUbicacion(distrito.trim(), direccion.trim());
    });
}

function inputFormRanges() {
    let ranges = document.querySelectorAll(".inputRange");
    Array.from(ranges).forEach((range) => {
        let field = range.previousElementSibling.querySelector(".inputNumber");
        range.addEventListener("input", (e) => field.value = e.target.value);
        field.addEventListener("input", (e) => range.value = e.target.value);
    });
}

function validarFormularios() {
    const forms = document.querySelectorAll(".needs-validation");
    Array.from(forms).forEach((form) => {
        form.addEventListener("submit", (e) => {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add("was-validated");
        });
    });
}

async function inicializarMapa(callback) {
    try {
        const coordenada = await ubicacion.obtenerCoordenada("Av. Javier prado 6979, la Molina");
        ubicacion.mostrarMapa(coordenada.latitud, coordenada.longitud, document.getElementById("mapa"));
        callback();
    } catch (error) {
        console.error(error);
        alertify.error("Ha ocurrido un problema al inicializar el mapa, recargue la página.")
    }
}

function whatsappLink(elementLink) {
    let adminTelefono = elementLink.getAttribute("data-adminTelefono");
    let whatsappWebUrl = "https://web.whatsapp.com/send?phone=" + adminTelefono;
    let appUrl = "https://wa.me/" + adminTelefono;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    elementLink.href = isMobile ? appUrl : whatsappWebUrl;
}

window.onload = async () => {
    validarFormularios();
    inputFormRanges();

    document.getElementById("formViabilidad") && (await inicializarMapa(clickUbicar));
    document.getElementById("formContacto") && (await inicializarMapa(() => {}));
    document.getElementById("contactUs") && whatsappLink(document.getElementById("contactUs"));
    document.getElementById("dataEvaluacion") && whatsappLink(document.getElementById("botonWhatsapp"));
};