function crearGrafica(titulo, data, elementHTML) {
    const xArray = data.map(item => item.clave);
    const yArray = data.map(item => item.valor);

    const options = [{
        x: yArray,
        y: xArray,
        type: "bar",
        orientation: "h",
        marker: { color:"rgba(255,0,0,0.6)" }
    }];
    const layout = {
        height: 900,
        width: 1000,
        title: titulo,
        margin: { l: 170 },
        yaxis: {
            tickfont: { size: 10 },
            tick: { pad: 90 },
            automargin: true,
            tickangle: -45,
            showline: true
        }
    };

    Plotly.newPlot(elementHTML, options, layout);
}

window.onload = () => {
    const grafica = document.getElementById("grafica");
    const graficaData = JSON.parse(grafica.textContent);
    grafica.textContent = "";
    crearGrafica("Ingresos y Egresos", graficaData["Ingresos y egresos"], grafica);
}