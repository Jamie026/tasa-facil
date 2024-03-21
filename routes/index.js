const { desformatearTexto } = require("./../helpers/functions.js");
const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

router.get("/", async (request, response) => {
    try {
        const dataResponses = await Promise.all([
            axios.get(process.env.RUTA_SEGME),
            axios.get(process.env.RUTA_ADMIN)
        ]);
        const segmentos = JSON.parse(dataResponses[0].data.body).map(segmento => desformatearTexto(segmento));
        const adminData = dataResponses[1].data;
        response.render("main", { adminData: adminData, segmentos: segmentos });
    } catch (error) {
        console.error(error);
        request.flash("error_msg", "Error al cargar los datos, recargue la página.");
        response.render("main");
    }
});

router.get("/informacion", async (request, response) => {
    try {
        const adminResponse = await axios.get(process.env.RUTA_ADMIN);
        const adminData = adminResponse.data;
        const adminTelefono = adminData.Codigo_de_telefono + adminData.Telefono;
        response.render("informacion", { adminTelefono: adminTelefono });
    } catch (error) {
        console.error(error);
        request.flash("error_msg", "Error al cargar los datos, recargue la página.");
        response.render("informacion");
    }
});

module.exports = router;