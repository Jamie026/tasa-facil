require('dotenv').config();
const path = require('path');
const axios = require('axios');
const PDF = require('html-pdf');
const fs = require('fs').promises;  
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const express = require('express');
const viabilidad = express.Router();

function formatearDato(data) {
    return typeof data === 'number' ? data.toFixed(2) :
        typeof data === 'string' ? data.replace(/_/g, ' ').toUpperCase() :
        data;
}

function formatearResultados(objectData, secciones) {
    const result = {};
    secciones.forEach((seccion) => {
        const seccionData = objectData.resultados[seccion];
        const seccionArray = [];
        for (const key in seccionData) 
            seccionArray.push({ clave: formatearDato(key), valor: formatearDato(seccionData[key])});
        result[formatearDato(seccion)] = seccionArray;
    });
    return result;
}

async function enviarEmail(evaluacionData, email, admin, usuarioData) {
    let errors = [];
    const secciones = admin ? ['cabida_diseño', 'ventas', 'terreno', 'obras', 'evaluacion', 'financiamiento', 'resultados', 'resumen'] : ["resumen"];
    const arraysDeObjetos = formatearResultados(evaluacionData, secciones);

    try {
        const hbsFilePath = path.join(__dirname, '..', 'views', 'partials', 'email.hbs');
        const templateSource = await fs.readFile(hbsFilePath, 'utf-8');
        const template = handlebars.compile(templateSource, { noEscape: true });
        const output = template({ data: arraysDeObjetos });

        const pdfPromise = new Promise((resolve, reject) => {
            PDF.create(output, { childProcessOptions: { env: { OPENSSL_CONF: '/dev/null' }}}).toFile((error, response) => error ? reject(error) : resolve(response));
        });

        const pdfResponse = await pdfPromise;
        const mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailDetails = {
            from: 'REDIN Soluciones inmobiliarias <redinsolucionesinmobiliarias@gmail.com>',
            to: email,
            subject: 'Resultado de la evaluación.',
            text: 
                `El siguiente PDF contiene información detallada de la evaluación.\n
                Información del usuario:\n
                Teléfono: ${usuarioData.telefono || 'No proporcionado'}\n
                Correo: ${usuarioData.correo}\n`,
            attachments: {
                filename: 'evaluación.pdf',
                path: pdfResponse.filename
            }
        };

        const sendMailPromise = new Promise((resolve, reject) => {
            mailTransporter.sendMail(mailDetails, (error, response) => error ? reject(error) : resolve(response));
        });

        await sendMailPromise;

    } catch (error) {
        console.error(error);
        errors.push("Ha ocurrido un error al generar PDF o al enviar el correo.");
    }

    return errors;
}

viabilidad.post('/', async (request, response) => {
    const data = request.body;
    try {
        const tasaCambio = await axios.get('https://api.apis.net.pe/v1/tipo-cambio-sunat');
        const adminResponse = await axios.get('https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros');
        const evaluacionResponse = await axios.post('https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/evaluar_inmueble', {
            "correo": data.email, "nombre": data.distrito.replace(/\b\w/g, char => char.toUpperCase()).replace(/\s+/g, '_'),
            "direccion": data.direccion, "segmento": data.segmento,
            "area": parseInt(data.area), "altura_max": parseInt(data.altura),
            "precio_m2_dol": parseInt(data.precio_m2), "posicion": data.posicion,
            "tipo_cambio": tasaCambio.data.compra, "telefono": data.telefono
        });
        const adminData = adminResponse.data;
        const evaluacionData = evaluacionResponse.data;
        enviarEmail(evaluacionData, adminData.correo, true, evaluacionData.datos_usuario);
        let errors = await enviarEmail(evaluacionData, evaluacionData.datos_usuario.correo, false, evaluacionData.datos_usuario);
        let messages = (errors.length !== 0) ? ["Evaluación realizada con éxito."] : ["Evaluación realizada con éxito", "La información fue enviada a su correo."];
        response.render('resumen', { errors: errors, success: messages, data: JSON.stringify(evaluacionData), adminTelefono: adminData.Codigo_de_telefono + adminData.Telefono });
    } catch (error) {
        console.log(error);
        response.redirect('/?errors=Ha+ocurrido+un+error+al+evaluar.+Intente+de+nuevo.');
    }
});

module.exports = viabilidad;