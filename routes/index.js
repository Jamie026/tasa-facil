const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (request, response) => {
    try {
        const adminResponse = await axios.get('https://4dbvkk2b12.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros');
        const adminData = adminResponse.data;
        const errors = request.query.errors ? [request.query.errors] : [];
        const messages = request.query.messages ? [request.query.messages] : [];
        response.render('main', { adminData: adminData, errors: errors, messages: messages }); 
    } catch (error) {
        console.error(error);
        response.render('main', { errors: ["Error al cargar los datos, recargue la página."] });
    }
});

router.get('/informacion', (request, response) => {
    response.render('informacion');
});

module.exports = router;
