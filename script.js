// Fatores de emissão de CO₂ por fonte (kg CO₂ / kWh)
const fatoresCO2 = {
    convencional: 0.10,
    solar: 0.02,
    eolica: 0.01,
    hidro: 0.02,
    bio: 0.03
};

// Nomes amigáveis das fontes
const nomesFontes = {
    convencional: 'Convencional',
    solar: 'Solar',
    eolica: 'Eólica',
    hidro: 'Hidrelétrica',
    bio: 'Bioenergia'
};

// Cores das fontes no gráfico
const coresFontes = {
    convencional: '#e53935',
    solar: '#f9a825',
    eolica: '#4fc3f7',
    hidro: '#0288d1',
    bio: '#66bb6a'
};

let chartInstance = null;

document.getElementById('calc-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const kwh = parseFloat(document.getElementById('kwh').value);
    const tarifa = parseFloat(document.getElementById('tarifa').value);
    const pessoas = parseInt(document.getElementById('pessoas').value);
    const fonte = document.getElementById('fonte').value;

    // Cálculos
    const custoMensal = kwh * tarifa;
    const custoAnual = custoMensal * 12;
    const consumoPorPessoa = kwh / pessoas;
    const co2Evitado = kwh * 12 * (fatoresCO2.convencional - fatoresCO2[fonte]);

    // Exibir resultados
    document.getElementById('res-custo').textContent = `R$ ${custoMensal.toFixed(2)}`;
    document.getElementById('res-anual').textContent = `R$ ${custoAnual.toFixed(2)}`;
    document.getElementById('res-pessoa').textContent = `${consumoPorPessoa.toFixed(1)} kWh`;
    document.getElementById('res-co2').textContent = `${co2Evitado.toFixed(1)} kg`;

    // Mostrar seção de resultados
    document.getElementById('resultados').classList.remove('hidden');

    // Gerar dados comparativos para o gráfico
    const labels = Object.keys(nomesFontes).map(k => nomesFontes[k]);
    const custos = Object.keys(nomesFontes).map(k => kwh * 12 * tarifa);
    const emissoes = Object.keys(nomesFontes).map(k => kwh * 12 * fatoresCO2[k]);
    const cores = Object.keys(nomesFontes).map(k => coresFontes[k]);

    // Destruir gráfico anterior se existir
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Criar gráfico
    const ctx = document.getElementById('chart-comparativo').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Custo Anual (R$)',
                    data: custos,
                    backgroundColor: cores.map(c => c + '99'),
                    borderColor: cores,
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Emissão CO₂ Anual (kg)',
                    data: emissoes,
                    backgroundColor: cores.map(c => c + '55'),
                    borderColor: cores,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Comparativo entre Fontes de Energia',
                    font: { size: 16, weight: 'bold' },
                    color: '#1b5e20'
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Custo Anual (R$)',
                        color: '#1b5e20'
                    },
                    ticks: { color: '#1b5e20' },
                    grid: { color: '#e0e0e0' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Emissão CO₂ (kg)',
                        color: '#e53935'
                    },
                    ticks: { color: '#e53935' },
                    grid: { drawOnChartArea: false }
                },
                x: {
                    ticks: { color: '#333' },
                    grid: { color: '#f0f0f0' }
                }
            }
        }
    });
});