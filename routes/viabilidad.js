require("dotenv").config();
const path = require("path");
const axios = require("axios");
const PDF = require("html-pdf");
const fs = require("fs").promises;
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const express = require("express");
const viabilidad = express.Router();

function formatearObject(objectData, admin) {
    const formatearValue = (key, value) => {
        if (typeof value === "number") {
            if (key === "Tipo_de_cambio") 
                return value.toFixed(2);
            else if (key === "%_de_departamentos_de_3D_x_piso" || key === "%_de_departamentos_de_2D_x_piso" || key === "%_de_departamentos_de_1D_x_piso" || key === "Margen_%" || key === "ROI_de_proyecto")
                return (Math.round(value * 100)) + "%";
            else 
                return Math.round(value);
        }
        else if (typeof value === "string")
            return value.toUpperCase().replace(/_/g, " ");
        else if (typeof value === "object")
            return formatearObject(value);
    };

    const result = {};
    const secciones = admin ? ["resumen_de_evaluacion"] : ["informacion_de_predio", "analisis_arquitectonico", "analisis_financiero", "analisis_valor_terreno"];

    secciones.forEach((seccion) => {
        const seccionData = objectData[seccion];
        const seccionArray = [];
        for (const key in seccionData) 
            seccionArray.push({ clave: key.toUpperCase().replace(/_/g, " "), valor: formatearValue(key, seccionData[key]) });
        result[seccion.toUpperCase().replace(/_/g, " ")] = seccionArray;
    });
    
    return result;
}

async function enviarEmail(evaluacionData, email) {
    try {
        const hbsFilePath = path.join(__dirname, "..", "views", "partials", "emailEvaluacion.hbs");
        const templateSource = await fs.readFile(hbsFilePath, "utf-8");
        const template = handlebars.compile(templateSource, { noEscape: true });
        const output = template({ data: evaluacionData });
        const options = {
            format: "A4",
            base: "http://localhost:3000",
            childProcessOptions: { env: { OPENSSL_CONF: '/dev/null' }}
        }

        const pdfResponse = await new Promise((resolve, reject) => {
            PDF.create(output, options).toFile((error, response) => {
                error ? reject(error) : resolve(response);
            });
        });

        const mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            },
        });

        const mailDetails = {
            from: "REDIN Perú <redinperu@gmail.com>",
            to: email,
            subject: "Resultado de la evaluación.",
            text: `El siguiente archivo contiene información detallada de una evaluación realizada por medio de REDIN.`,
            attachments: {
                filename: "Información.pdf",
                path: pdfResponse.filename
            }
        };
        mailTransporter.sendMail(mailDetails);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

viabilidad.post("/", async (request, response) => {
    const data = request.body;
    try {
        const tasaCambio = await axios.get("https://api.apis.net.pe/v1/tipo-cambio-sunat");
        const adminResponse = await axios.get("https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros");
        const evaluacionResponse = await axios.post("https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/evaluar_inmueble", {
            correo: data.email,
            nombre: data.distrito.replace(/\b\w/g, (char) => char.toUpperCase()).replace(/\s+/g, "_"),
            direccion: data.direccion,
            segmento: data.segmento,
            area: parseInt(data.area),
            altura_max: parseInt(data.altura),
            precio_m2_dol: parseInt(data.precio_m2),
            posicion: data.posicion,
            tipo_cambio: tasaCambio.data.compra,
            telefono: data.telefono
        });

        const adminData = adminResponse.data;
        const evaluacionData = evaluacionResponse.data;
        const correosEnviados = await Promise.all([
            enviarEmail(formatearObject(evaluacionData.usuario, false), adminData.Correo),
            enviarEmail(formatearObject({"resumen_de_evaluacion": evaluacionData.admin}, true), evaluacionData.usuario.informacion_de_predio["Correo_electronico"])
        ]);

        if (!correosEnviados[0] || !correosEnviados[1])
            throw new Error("Error al enviar PDF");
        response.render("resumen", { success: ["Evaluación realizada con éxito"], data: JSON.stringify(evaluacionData.usuario), adminTelefono: adminData.Codigo_de_telefono + adminData.Telefono });
    } catch (error) {
        console.log(error);
        response.redirect("/?errors=Ha+ocurrido+un+error+al+evaluar.+Intente+de+nuevo.");
    }
});

module.exports = viabilidad;