require('dotenv').config();
const express = require('express');
const axios = require('axios');
const contacto = express.Router();
const nodemailer = require('nodemailer');

async function enviarEmail(email, usuarioData, admin) {
    let errors = [];
    let text = admin ? 
        `Un usuario acaba de llenar el formulario de contacto y ha proporcionado la siguiente información:\n
            Nombre o razón de social: ${usuarioData.nombre}\n
            Teléfono: ${usuarioData.telefono}\n
            Correo: ${usuarioData.email}\n
            Motivo de contacto: ${usuarioData.motivo}\n
            Descripción detallada de la solicitud: ${usuarioData.solicitud}\n` : 
        `Su solicitud fue enviada con éxito, nos aseguraremos de responderle lo antes posible.\n 
            Gracias por su paciencia.`
    try {
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
            subject: 'Formulario de contacto.',
            text: text
        };

        const sendMailPromise = new Promise((resolve, reject) => {
            mailTransporter.sendMail(mailDetails, (error, response) => error? reject(error) : resolve(response));
        });

        await sendMailPromise;

    } catch (error) {
        console.error(error);
        errors.push("Ha ocurrido un error al enviar el correo.");
    }

    return errors;
}

contacto.get('/', async (request, response) => {
    try {
        const adminResponse = await axios.get('https://4dbvkk2b12.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros');
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
        const adminResponse = await axios.get('https://4dbvkk2b12.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros');
        const adminData = adminResponse.data;
        let errors = await enviarEmail(adminData.correo, request.body, true);
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