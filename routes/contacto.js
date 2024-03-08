require('dotenv').config();
const express = require('express');
const axios = require('axios');
const contacto = express.Router();
const nodemailer = require('nodemailer');

function construirTextoAdmin(usuarioData) {
    return `Un usuario acaba de llenar el formulario de contacto y ha proporcionado la siguiente información:\n
        Nombre o razón social: ${usuarioData.nombre}
        Teléfono: ${usuarioData.telefono}
        Correo: ${usuarioData.email}
        Motivo de contacto: ${usuarioData.motivo}
        Descripción detallada de la solicitud: ${usuarioData.solicitud || 'No proporcionada'}`;
}

function construirTextoUsuario() {
    return `Su solicitud fue enviada con éxito, nos aseguraremos de responderle lo antes posible.\n
        Gracias por su paciencia.`;
}

async function enviarEmail(email, usuarioData, admin) {
    let errors = [];
    let text = admin ? construirTextoAdmin(usuarioData) : construirTextoUsuario();
    try {
        const mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
        });

        const mailDetails = {
            from: 'REDIN Soluciones inmobiliarias <redinsolucionesinmobiliarias@gmail.com>',
            to: email,
            subject: 'Formulario de contacto.',
            text: text
        };

        mailTransporter.sendMail(mailDetails);
    } catch (error) {
        console.error(error);
        errors.push("Ha ocurrido un error al enviar el correo.");
    }
    return errors;
}

contacto.get('/', async (request, response) => {
    try {
        const adminResponse = await axios.get('https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros');
        const adminData = adminResponse.data;
        const errors = request.query.errors ? request.query.errors.split(',') : [];
        const messages = request.query.messages ? request.query.messages.split(',') : [];
        response.render('contacto', { adminData: adminData, errors: errors, success: messages });
    } catch (error) {
        console.error(error);
        response.render('contacto', { errors: ["Error al cargar los datos, recargue la página."] });
    }
});


contacto.post('/enviarForm', async (request, response) => {
    try {
        const adminResponse = await axios.get('https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros');
        const adminData = adminResponse.data;
        let errors = await enviarEmail(adminData.Correo, request.body, true);
        if (errors.length > 0) 
            throw new Error('Error al enviar el formulario');
        enviarEmail(request.body.email, request.body, false);
        response.redirect('/contacto?messages=Su+solicitud+ha+sido+enviada+correctamente.');
    } 
    catch (error) {
        console.log(error);
        response.redirect('/contacto?errors=Ha+ocurrido+un+error+al+enviar+su+solicitud.+Intente+de+nuevo.');
    }
});

module.exports = contacto;    