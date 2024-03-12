import * as ubicacion from "./map.js";

function crearGrafica(titulo, data, elementHTML) {
    const xArray = data.map(item => item.clave);
    const yArray = data.map(item => item.valor);
    const options = [{
        x: yArray,
        y: xArray,
        type: "bar",
        text: yArray.map(valor => valor + "%"),
        orientation: "h",
        marker: { color:"rgba(255,0,0,0.6)" }
    }];
    const layout = {
        height: 900,
        width: 1200,
        title: titulo,
        margin: { l: 150 },
        yaxis: {
            tickfont: { size: 15 },
            tick: { pad: 90 },
            automargin: true,
            showline: true
        },
        titlefont: { size: 30 }
    };

    Plotly.newPlot(elementHTML, options, layout, { displayModeBar: false });
}

function formatearTexto(texto) {
    return texto.replace(/\b\w/g, char => char.toUpperCase()).replace(/\s+/g, "_");
}

async function actualizarUbicacion(distrito, direccion) {
    const direccionCompleta = distrito + " " + direccion;
    try {
        alertify.notify("Actualizando ubicación...", "warning", 5);
        const coordenada = await ubicacion.obtenerCoordenada("Perú" + direccionCompleta);
        const segmentos = await ubicacion.obtenerSegmentos(formatearTexto(distrito));
        const segmentosFormateados = Object.values(segmentos).map((segmento) => segmento.M.coordenada.S);
        const mapaData = ubicacion.mostrarMapa(coordenada.latitud, coordenada.longitud, document.getElementById("mapa"));

        let numSegmento = 0;
        let encontrado = false;

        segmentosFormateados.forEach((segmento, index) => {
            if (encontrado) return;
            if (ubicacion.perteneceSegmento({ latitud: coordenada.latitud, longitud: coordenada.longitud }, segmento)) {
                numSegmento = index + 1;
                encontrado = true;
            }
        });

        document.getElementById("imageMapa").value = mapaData.mapImageURL;
        document.getElementById("segmento").value = numSegmento;
        document.getElementById("ubicacionInput").value = direccionCompleta;
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
        (!distrito || !direccion) ? alertify.error("Indique el distrito y la dirección") : await actualizarUbicacion(distrito, direccion);
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
    document.getElementById("grafica") && (() =>{
        const grafica = document.getElementById("grafica");
        const graficaData = JSON.parse(grafica.getAttribute("data-grafica"));
        crearGrafica("Ingresos y Egresos", graficaData["Ingresos y egresos"], grafica);
    })();
};