function crearGrafica(titulo, data, elementHTML) {
    const xArray = data.map(item => item.clave);
    const yArray = data.map(item => item.valor);
    const options = [{
        values: xArray,
        labels: yArray,
        type: "pie"
    }];
    const layout = {
        title: titulo,
        height: 300
    };
    Plotly.newPlot(elementHTML, options, layout);
}

window.onload = () => {
    document.getElementById("grafica") && (() => {
        const grafica = document.getElementById("grafica");
        const graficaData = JSON.parse(graficaElement.getAttribute("data-grafica"));
        crearGrafica("Ingresos y Egresos", graficaData["Ingresos y egresos"], graficaElement);
    })();
}