function redondearPersonalizado(numero) {
    const decimal = Number(numero.toString().split('.')[1].charAt(0));
    return decimal > 5 ? Math.ceil(numero) : Math.floor(numero);
}

function formatearDato(key, data) {
    if (typeof data === 'number') {
        if (key === 'tc') 
            return data.toFixed(2);
        else if (key === 'ROI_de_proyecto' || key === 'margen_%' || key === '%_de_departamentos_de_3D_x_piso' || key === '%_de_departamentos_de_2D_x_piso' || key === '%_de_departamentos_de_1D_x_piso') 
            return `${redondearPersonalizado(data * 100)}%`;
        else 
            return redondearPersonalizado(data);
    }
    else if (typeof data === 'string') 
        return data.replace(/_/g, ' ').toUpperCase();
    else
        return data;
}

function checkViabilidad(tableElement, evaluacionData) {
    const viabilidad = evaluacionData.resultados.resumen.viabilidad;
    const resumenData = evaluacionData.resultados.resumen;
    const mensajesViabilidad = {
        0: 'No es viable, la situación es negativa.',
        1: 'Es viable, pero requiere modificaciones.',
        2: 'Es viable tal como lo indica el usuario.'
    };
    agregarFila(tableElement, "VIABILIDAD", mensajesViabilidad[viabilidad].toUpperCase());

    if(viabilidad === 0)
        return 0;

    for (const key in resumenData) {
        if (key !== 'viabilidad') {
            const caracteristica = formatearDato(key, key);
            const detalle = formatearDato(key, resumenData[key]);
            agregarFila(tableElement, caracteristica, detalle, false);
        }
    }
}

function agregarFila(tableElement, caracteristica, detalle) {
    const tbody = document.getElementById(tableElement);
    const newRow = tbody.insertRow();
    newRow.insertCell(0).textContent = caracteristica;
    newRow.insertCell(1).textContent = detalle;
}

export { checkViabilidad };