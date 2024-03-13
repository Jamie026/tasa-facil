require("dotenv").config();
const axios = require("axios");
const express = require("express");
const viabilidad = express.Router();
const { formatearTexto, desformatearTexto, prepararEnvio } = require("./../helpers/functions.js");

function formatearObjecto(objectoData, secciones) {

    const formatearValue = (key, value) => {
        if (typeof value === "number") {
            if (key === "Tipo_de_cambio") 
                return value.toFixed(2);
            else if (key === "%_de_departamentos_de_3D_x_piso" || key === "%_de_departamentos_de_2D_x_piso" || 
                    key === "%_de_departamentos_de_1D_x_piso" || key === "Margen_%" || key === "ROI_de_proyecto")
                return (Math.round(value * 100)) + "%";
            else 
                return new Intl.NumberFormat('en-US').format(Math.round(value));
        }
        else if (typeof value === "string")
            return desformatearTexto(value);
        else if (typeof value === "object")
            return formatearObjecto(value);
    };

    const result = {};
    secciones.forEach((seccion) => {
        const seccionData = objectoData[seccion];
        const seccionArray = [];
        for (const key in seccionData) 
            seccionArray.push({ clave: desformatearTexto(key), valor: formatearValue(key, seccionData[key]) });
        result[desformatearTexto(seccion)] = seccionArray;
    });
    
    return result;
}

viabilidad.post("/", async (request, response) => {
    const dataBody = request.body;
    try {
        const tasaCambio = await axios.get("https://api.apis.net.pe/v1/tipo-cambio-sunat");
        const adminResponse = await axios.get(process.env.RUTA_ADMIN);
        const evaluacionResponse = await axios.post(process.env.RUTA_EVALUACION, {
            correo: dataBody.email, nombre: formatearTexto((dataBody.distrito.trim()).toLowerCase()),
            direccion: dataBody.direccion, segmento: dataBody.segmento,
            area: parseInt(dataBody.area), altura_max: parseInt(dataBody.altura),
            precio_m2_dol: parseInt(dataBody.precio_m2), posicion: dataBody.posicion,
            tipo_cambio: tasaCambio.data.compra, telefono: dataBody.telefono
        });
        const adminData = adminResponse.data;
        const evaluacionData = evaluacionResponse.data;
        const adminTelefono = adminData.Codigo_de_telefono + adminData.Telefono;
        const adminEnvio = { 
            correo: adminData.Correo,
            data: {
                evaluacion: formatearObjecto(evaluacionData.admin, ["resumen_de_evaluacion"]),
                imageMapa: dataBody.imageMapa,
                graficaData: formatearObjecto(evaluacionData.admin, ["Ingresos_y_egresos"]),
                admin: true
            }
        }
        const usuarioEnvio = {
            correo: evaluacionData.usuario.informacion_de_predio["Correo_electronico"],
            data: {
                evaluacion: formatearObjecto(evaluacionData.usuario, ["informacion_de_predio", "analisis_arquitectonico", "analisis_financiero", "analisis_valor_terreno"]),
                imageMapa: dataBody.imageMapa,
                usuario: true
            }
        }
        const correosEnviados = await Promise.all([
            prepararEnvio(usuarioEnvio.data, "viabilidad", usuarioEnvio.correo),
            prepararEnvio(adminEnvio.data, "viabilidad", adminEnvio.correo)
        ]);
        if (!correosEnviados[0] || !correosEnviados[1])
            throw new Error("Error durante la creación del PDF para el envio");
        response.render("viabilidad", { success: ["La evaluación ha sido enviada a su correo."], data: usuarioEnvio.data, adminTelefono: adminTelefono});
    } catch (error) {
        console.log(error);
        response.redirect("/?errors=Ha+ocurrido+un+error+al+evaluar.+Intente+de+nuevo.");
    }
});

viabilidad.get("/PDF", (request, response) => {
    try {
        const data = JSON.parse(request.query.data);
        response.render("viabilidadPDF", { data });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        response.status(500).send('Error al procesar la solicitud');
    }
});


module.exports = viabilidad;