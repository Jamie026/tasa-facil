require("dotenv").config();
const axios = require("axios");
const express = require("express");
const contacto = express.Router();
const { enviarArchivo } = require("./../helpers/functions.js");

contacto.get("/", async (request, response) => {
    try {
        const adminResponse = await axios.get(process.env.RUTA_ADMIN);
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
        const dataBody = request.body;
        const adminResponse = await axios.get(process.env.RUTA_ADMIN);
        const adminData = adminResponse.data;
        dataBody.solicitud = dataBody.solicitud ? dataBody.solicitud : "No proporciono una descripción";
        const usuarioEnvio = {
            correo: dataBody.email,
            data: {
                solicitud: dataBody
            }
        }
        const adminEnvio = {
            correo: adminData.Correo,
            data: {
                solicitud: dataBody
            }
        }
        const correosEnviados = await Promise.all([
            enviarArchivo(adminEnvio.data, "contacto", adminEnvio.correo),
            enviarArchivo(usuarioEnvio.data, "contacto", usuarioEnvio.correo)
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