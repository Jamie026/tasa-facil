require("dotenv").config();
const express = require("express");
const axios = require("axios");
const contacto = express.Router();
const nodemailer = require("nodemailer");

async function enviarEmail(email, usuarioData) {
    try {
        const mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailDetails = {
            from: "REDIN Perú <redinperu@gmail.com>",
            to: email,
            subject: "Formulario de contacto.",
            text: `El siguiente archivo contiene información detallada de una solicitud de contacto realizada por medio de REDIN.`,
        };

        mailTransporter.sendMail(mailDetails);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

contacto.get("/", async (request, response) => {
    try {
        const adminResponse = await axios.get("https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros");
        const adminData = adminResponse.data;
        const errors = request.query.errors ? request.query.errors.split(",") : [];
        const messages = request.query.messages ? request.query.messages.split(",") : [];
        response.render("contacto", { adminData: adminData, errors: errors, success: messages });
    } catch (error) {
        console.error(error);
        response.render("contacto", { errors: ["Error al cargar los datos, recargue la página."] });
    }
});

contacto.post("/enviarForm", async (request, response) => {
    try {
        const adminResponse = await axios.get("https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros");
        const adminData = adminResponse.data;

        const correosEnviados = await Promise.all([
            enviarEmail(adminData.Correo, request.body),
            enviarEmail(request.body.email, request.body)
        ]);
        if (!correosEnviados[0] || !correosEnviados[1])
            throw new Error("Error al enviar el formulario");
        response.redirect("/contacto?messages=Su+solicitud+ha+sido+enviada+correctamente.");
    } catch (error) {
        console.log(error);
        response.redirect("/contacto?errors=Ha+ocurrido+un+error+al+enviar+su+solicitud.+Intente+de+nuevo.");
    }
});

module.exports = contacto;