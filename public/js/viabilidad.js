function crearGrafica(titulo, data, elementHTML) {
    const xArray = data.map(item => item.clave);
    const yArray = data.map(item => item.valor);
    const options = [{
        x: yArray,
        y: xArray,
        type: "bar",
        text: yArray.map(valor => valor + "%"),
        orientation: "h",
        marker: { color:"rgba(255,0,0,0.6)" }
    }];
    const layout = {
        height: 900,
        width: 1050,
        title: titulo,
        margin: { l: 250 },
        yaxis: {
            tickfont: { size: 12 },
            tick: { pad: 100 },
            automargin: true,
            tickangle: -45,
            showline: true
        },
        titlefont: { size: 24 }
    };

    Plotly.newPlot(elementHTML, options, layout, { displayModeBar: false });
}

window.onload = () => {
    const grafica = document.getElementById("grafica");
    const graficaData = JSON.parse(grafica.textContent);
    grafica.textContent = "";
    crearGrafica("Ingresos y Egresos", graficaData["Ingresos y egresos"], grafica);
}