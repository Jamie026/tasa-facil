const { desformatearTexto } = require("./../helpers/functions.js");
const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const { log } = require("console");

router.get("/", async (request, response) => {
    try {
        const dataResponses = await Promise.all([
            axios.get(process.env.RUTA_DISTRITOS),
            axios.get(process.env.RUTA_ADMIN)
        ]);
        const adminData = dataResponses[1].data;
        const distritosData = dataResponses[0].data
        if(adminData.statusCode != 200 || distritosData.statusCode != 200)
            throw new Error("Error con el servidor");
        const distritosNombres = JSON.parse(distritosData.response).map(distrito => desformatearTexto(distrito));
        const errors = request.query.errors ? [request.query.errors] : [];
        const success = request.query.success ? [request.query.success] : [];
        response.render("main", { adminData: adminData.response, errors: errors, success: success, distritos: distritosNombres });
    } catch (error) {
        console.error(error);
        response.render("main", { errors: ["Error al cargar los datos, recargue la página."] });
    }
});

router.get("/informacion", async (request, response) => {
    try {
        const adminResponse = await axios.get(process.env.RUTA_ADMIN);
        const adminData = adminResponse.data;
        if(adminData.statusCode != 200) 
            throw new Error("Error con el servidor");
        const adminTelefono = adminData.response.Codigo_de_telefono + adminData.response.Telefono;
        response.render("informacion", { adminTelefono: adminTelefono });
    } catch (error) {
        console.error(error);
        response.render("informacion", { errors: ["Error al cargar los datos, recargue la página."] });
    }
});

router.get("/mapa-comercial", async (request, response) => {
    try {
        const distritosResponse = await axios.get(process.env.RUTA_DISTRITOS)
        const distritosData = distritosResponse.data
        if(distritosData.statusCode != 200)
            throw new Error("Error con el servidor");
        const distritosNombres = JSON.parse(distritosData.response).map(distrito => distrito);
        const imagesPath = path.join(__dirname, "..", "public", "img", "distritos");
        const urls = distritosNombres.map(distrito =>{
            const image = path.join(imagesPath, distrito + ".jpeg");
            if (fs.existsSync(image)) 
                return "img/distritos/" + distrito + ".jpeg";
        }).filter(Boolean).sort((a, b) => {
            const nameA = a.split('/').pop().toLowerCase();
            const nameB = b.split('/').pop().toLowerCase();
            return nameA.localeCompare(nameB);
        });
        response.render("mapa-comercial", { distritos: urls });
    } catch (error) {
        console.error(error);
        response.render("mapa-comercial", { errors: ["Error al cargar los datos, recargue la página."] });
    }
})

module.exports = router;