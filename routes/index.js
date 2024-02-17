const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (request, response) => {
    try {
        const adminResponse = await axios.get('https://4dbvkk2b12.execute-api.us-east-1.amazonaws.com/dev/tasafacil/listar_parametros');
        const adminData = adminResponse.data;
        const errors = request.query.errors ? request.query.errors.split(',') : [];
        response.render('main', { adminData: adminData, errors: errors, adminTelefono: adminData.codigo_de_telefono + adminData.telefono }); 
    } catch (error) {
        console.error(error);
        response.render('main', { layout: 'index', errors: ["Error al cargar los datos, recargue la página."] });
    }
});

module.exports = router;
