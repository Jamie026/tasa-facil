const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (request, response) => {
    try {
        const adminResponse = await axios.get('https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros');
        const adminData = adminResponse.data;
        const errors = request.query.errors ? [request.query.errors] : [];
        const messages = request.query.messages ? [request.query.messages] : [];
        response.render('main', { adminData: adminData, errors: errors, messages: messages }); 
    } catch (error) {
        console.error(error);
        response.render('main', { errors: ["Error al cargar los datos, recargue la página."] });
    }
});

router.get('/informacion', async (request, response) => {
    try {
        const adminResponse = await axios.get('https://o7n3nvm6l1.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros');
        const adminData = adminResponse.data;
        response.render('informacion', { adminTelefono: adminData.Codigo_de_telefono + adminData.Telefono });
    } catch (error) {
        console.error(error);
        response.render('informacion', { errors: ["Error al cargar los datos, recargue la página."] });
    }
});

module.exports = router;
