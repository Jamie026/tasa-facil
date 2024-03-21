require("dotenv").config();
const axios = require("axios");
const express = require("express");
const contacto = express.Router();
const { prepararEnvio } = require("./../helpers/functions.js");

contacto.get("/", async (request, response) => {
    try {
        const adminResponse = await axios.get(process.env.RUTA_ADMIN);
        const adminData = adminResponse.data;
        response.render("contacto", { adminData: adminData });
    } catch (error) {
        console.error(error);
        request.flash("error_msg", "Error al cargar los datos, recargue la página.");
        response.render("contacto");
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
            prepararEnvio(adminEnvio.data, "contacto", adminEnvio.correo),
            prepararEnvio(usuarioEnvio.data, "contacto", usuarioEnvio.correo)
        ]);
        if (!correosEnviados[0] || !correosEnviados[1])
            throw new Error("Error al enviar el formulario");
        request.flash("success_msg", "Su solicitud de contacto ha sido enviada con éxito.");
        response.redirect("/contacto");
    } catch (error) {
        console.log(error);
        request.flash("error_msg", "Error al enviar su solicitud de contacto.");
        response.redirect("/contacto");
    }
});

module.exports = contacto;