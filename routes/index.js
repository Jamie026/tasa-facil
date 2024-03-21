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
        const errors = request.query.errors ? [request.query.errors] : [];
        const success = request.query.success ? [request.query.success] : [];
        response.render("main", { adminData: adminData, errors: errors, success: success, segmentos: segmentos });
    } catch (error) {
        console.error(error);
        response.render("main", { errors: ["Error al cargar los datos, recargue la página."] });
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
        response.render("informacion", { errors: ["Error al cargar los datos, recargue la página."] });
    }
});

module.exports = router;