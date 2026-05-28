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

// Irradiação solar média por estado do Brasil (kWh/m²/dia)
const irradiacaoSolarPorEstado = {
    AC: 4.5, AL: 5.2, AP: 4.3, AM: 4.2, BA: 5.5,
    CE: 5.8, DF: 5.3, ES: 4.8, GO: 5.4, MA: 5.6,
    MT: 5.3, MS: 5.2, MG: 5.1, PA: 4.5, PB: 5.7,
    PR: 4.6, PE: 5.6, PI: 5.5, RJ: 4.7, RN: 5.8,
    RS: 4.4, RO: 4.8, RR: 4.6, SC: 4.5, SP: 4.9,
    SE: 5.3, TO: 5.4
};

// Velocidade média do vento por estado (m/s) - usado para viabilidade eólica
const velocidadeVentoPorEstado = {
    AC: 3.2, AL: 6.8, AP: 3.5, AM: 2.8, BA: 6.5,
    CE: 7.2, DF: 4.0, ES: 4.5, GO: 4.2, MA: 5.8,
    MT: 4.0, MS: 4.3, MG: 4.8, PA: 3.0, PB: 7.0,
    PR: 4.5, PE: 6.9, PI: 6.2, RJ: 4.2, RN: 7.5,
    RS: 5.0, RO: 3.5, RR: 3.0, SC: 5.2, SP: 4.0,
    SE: 6.5, TO: 4.5
};

// Potencial hidrelétrico por estado (fator 1-10)
const potencialHidroPorEstado = {
    AC: 6, AL: 3, AP: 5, AM: 9, BA: 5,
    CE: 2, DF: 2, ES: 5, GO: 5, MA: 6,
    MT: 8, MS: 5, MG: 8, PA: 10, PB: 2,
    PR: 7, PE: 3, PI: 4, RJ: 6, RN: 2,
    RS: 6, RO: 7, RR: 5, SC: 7, SP: 6,
    SE: 3, TO: 6
};

// Potencial de biomassa por estado (fator 1-10, baseado em agronegócio)
const potencialBioPorEstado = {
    AC: 4, AL: 6, AP: 3, AM: 4, BA: 8,
    CE: 5, DF: 3, ES: 5, GO: 9, MA: 7,
    MT: 10, MS: 9, MG: 8, PA: 6, PB: 5,
    PR: 9, PE: 7, PI: 7, RJ: 4, RN: 5,
    RS: 8, RO: 5, RR: 3, SC: 7, SP: 8,
    SE: 5, TO: 7
};

// Nomes dos estados por sigla
const nomesEstados = {
    AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
    CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
    MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba',
    PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
    RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
    SE: 'Sergipe', TO: 'Tocantins'
};

let chartInstance = null;

document.getElementById('calc-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const kwh = parseFloat(document.getElementById('kwh').value);
    const tarifa = parseFloat(document.getElementById('tarifa').value);
    const pessoas = parseInt(document.getElementById('pessoas').value);
    const fonte = document.getElementById('fonte').value;
    const estado = document.getElementById('estado').value;

    // Cálculos básicos
    const custoMensal = kwh * tarifa;
    const custoAnual = custoMensal * 12;
    const consumoPorPessoa = kwh / pessoas;
    const co2EmitidoAnual = kwh * 12 * fatoresCO2[fonte];
    const co2EvitadoAnual = kwh * 12 * (fatoresCO2.convencional - fatoresCO2[fonte]);

    // Exibir resultados básicos
    document.getElementById('res-custo').textContent = `R$ ${custoMensal.toFixed(2)}`;
    document.getElementById('res-anual').textContent = `R$ ${custoAnual.toFixed(2)}`;
    document.getElementById('res-pessoa').textContent = `${consumoPorPessoa.toFixed(1)} kWh`;
    document.getElementById('res-co2-emitido').textContent = `${co2EmitidoAnual.toFixed(1)} kg`;
    document.getElementById('res-co2-evitado').textContent = `${co2EvitadoAnual.toFixed(1)} kg`;

    // Determinar melhor fonte de energia renovável primeiro
    const melhorFonte = determinarMelhorFonte(kwh, tarifa, estado);
    exibirRecomendacao(melhorFonte);

    // Análise de viabilidade da fonte recomendada se estado foi selecionado
    if (estado) {
        const analiseViabilidade = calcularViabilidadeFonte(melhorFonte.fonte, kwh, tarifa, estado, custoAnual);
        exibirAnaliseViabilidade(analiseViabilidade, melhorFonte.nome);
    } else {
        document.getElementById('analise-viabilidade').classList.add('hidden');
    }

    // Gerar diagnóstico personalizado
    const diagnostico = gerarDiagnostico(kwh, consumoPorPessoa, fonte, custoMensal, melhorFonte.fonte);
    exibirDiagnostico(diagnostico);

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
            aspectRatio: window.innerWidth < 640 ? 1.2 : 2,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Comparativo entre Fontes de Energia',
                    font: { size: window.innerWidth < 640 ? 12 : 16, weight: 'bold' },
                    color: '#1b5e20'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Custo Anual (R$)',
                        color: '#1b5e20',
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    },
                    ticks: { color: '#1b5e20', font: { size: window.innerWidth < 640 ? 9 : 11 } },
                    grid: { color: '#e0e0e0' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Emissão CO₂ (kg)',
                        color: '#e53935',
                        font: { size: window.innerWidth < 640 ? 10 : 12 }
                    },
                    ticks: { color: '#e53935', font: { size: window.innerWidth < 640 ? 9 : 11 } },
                    grid: { drawOnChartArea: false }
                },
                x: {
                    ticks: { color: '#333', font: { size: window.innerWidth < 640 ? 9 : 11 } },
                    grid: { color: '#f0f0f0' }
                }
            }
        }
    });
});

// Função dispatcher para calcular viabilidade da fonte recomendada
function calcularViabilidadeFonte(fonte, kwh, tarifa, estado, custoAnual) {
    switch (fonte) {
        case 'solar':
            return calcularViabilidadeSolar(kwh, tarifa, estado, custoAnual);
        case 'eolica':
            return calcularViabilidadeEolica(kwh, tarifa, estado, custoAnual);
        case 'hidro':
            return calcularViabilidadeHidro(kwh, tarifa, estado, custoAnual);
        case 'bio':
            return calcularViabilidadeBio(kwh, tarifa, estado, custoAnual);
        default:
            return calcularViabilidadeSolar(kwh, tarifa, estado, custoAnual);
    }
}

// Função para calcular viabilidade de energia solar (modelo realista)
function calcularViabilidadeSolar(kwh, tarifa, estado, custoAnual) {
    const irradiacao = irradiacaoSolarPorEstado[estado] || 5.0;

    // Performance Ratio realista do sistema fotovoltaico (0.78-0.82)
    // Considera perdas de: temperatura, sujeira, inversor, cabeamento, mismatch, sombreamento
    const performanceRatio = 0.80;

    // Potência necessária para cobrir o consumo mensal (kWp)
    // Geração mensal = potencia × irradiacao × 30 × PR
    const potenciaNecessaria = kwh / (irradiacao * 30 * performanceRatio);
    // Arredondar para múltiplo de 0.5 kWp (tamanho comercial típico)
    const potenciaSistema = Math.ceil(potenciaNecessaria * 2) / 2;

    // Custo por kWp com escala (valores realistas do mercado brasileiro 2024/2025)
    let custoPorKwp;
    if (potenciaSistema < 2) {
        custoPorKwp = 5500;        // Sistemas muito pequenos: mais caro por kWp
    } else if (potenciaSistema < 5) {
        custoPorKwp = 4500;        // Residencial pequeno
    } else if (potenciaSistema < 10) {
        custoPorKwp = 4000;        // Residencial médio
    } else {
        custoPorKwp = 3500;        // Residencial grande / comercial pequeno
    }
    const custoInstalacao = potenciaSistema * custoPorKwp;

    // Geração anual real estimada (kWh)
    const geracaoAnual = potenciaSistema * irradiacao * 365 * performanceRatio;
    const geracaoMensal = geracaoAnual / 12;

    // Cobertura real da conta (máximo 95% por causa do mínimo da concessionária)
    const cobertura = Math.min(geracaoMensal / kwh, 0.95);
    const coberturaPercent = cobertura * 100;

    // Mínimo da concessionária que permanece mesmo com compensação (média R$ 50/mês)
    const minimoConcessionariaAnual = 50 * 12;

    // Economia bruta anual (antes de despesas operacionais)
    const economiaBruta = cobertura * custoAnual;

    // Manutenção anual: limpeza, revisão elétrica, possível seguro (~1.5% do investimento)
    const manutencaoAnual = custoInstalacao * 0.015;

    // Economia líquida ano 1 (descontando mínimo da concessionária e manutenção)
    const economiaAnual = economiaBruta - minimoConcessionariaAnual - manutencaoAnual;

    // Payback simples em anos (proteção contra divisão por zero ou negativo)
    const payback = economiaAnual > 0 ? custoInstalacao / economiaAnual : 999;

    // Cálculo de economia acumulada em 25 anos (vida útil dos painéis)
    const taxaDegradacao = 0.005; // Degradação dos painéis: 0.5% ao ano
    let economiaAcumulada = 0;

    for (let ano = 1; ano <= 25; ano++) {
        const fatorDegradacao = Math.pow(1 - taxaDegradacao, ano - 1);
        const economiaAno = (economiaBruta - minimoConcessionariaAnual - manutencaoAnual) * fatorDegradacao;
        economiaAcumulada += economiaAno;
    }

    // Troca do inversor no ano 12 (vida útil ~10-12 anos, custo ~15% do investimento inicial)
    const custoInversor = custoInstalacao * 0.15;

    // Economia líquida total em 25 anos (economia acumulada - investimento - troca inversor)
    const economia25anos = economiaAcumulada - custoInstalacao - custoInversor;

    // ROI em 25 anos (%)
    const roi = (economia25anos / custoInstalacao) * 100;

    const { viabilidade, viabilidadeClass } = classificarViabilidade(payback);

    return {
        fonte: 'solar',
        metrica1: irradiacao,
        metrica1Label: 'Irradiação Solar',
        metrica1Unidade: 'kWh/m²/dia',
        metrica2: potenciaSistema,
        metrica2Label: 'Potência do Sistema',
        metrica2Unidade: 'kWp',
        custoInstalacao,
        economiaAnual,
        payback,
        viabilidade,
        viabilidadeClass,
        // Métricas extras específicas do solar
        geracaoAnual,
        coberturaPercent,
        economia25anos,
        roi
    };
}

// Função para calcular viabilidade de energia eólica
function calcularViabilidadeEolica(kwh, tarifa, estado, custoAnual) {
    const velocidadeVento = velocidadeVentoPorEstado[estado] || 4.0;
    const nomeEstado = nomesEstados[estado] || estado;

    // Fator de capacidade baseado na velocidade do vento (turbina pequena residencial)
    let fatorCapacidade = 0.15;
    if (velocidadeVento >= 7) fatorCapacidade = 0.35;
    else if (velocidadeVento >= 5) fatorCapacidade = 0.25;
    else if (velocidadeVento >= 3.5) fatorCapacidade = 0.18;

    // Potência estimada da turbina necessária (kW)
    const potenciaNecessaria = kwh / (720 * fatorCapacidade);
    const potenciaTurbina = Math.max(1, Math.ceil(potenciaNecessaria));

    // Custo estimado (R$ 8000-12000 por kW para pequenas turbinas)
    const custoPorKw = 10000;
    const custoInstalacao = potenciaTurbina * custoPorKw;

    // Economia anual (85% da conta)
    const economiaAnual = custoAnual * 0.85;
    const payback = custoInstalacao / economiaAnual;

    const { viabilidade, viabilidadeClass } = classificarViabilidade(payback);

    return {
        fonte: 'eolica',
        metrica1: velocidadeVento,
        metrica1Label: 'Velocidade do Vento',
        metrica1Unidade: 'm/s',
        metrica2: potenciaTurbina,
        metrica2Label: 'Potência da Turbina',
        metrica2Unidade: 'kW',
        custoInstalacao,
        economiaAnual,
        payback,
        viabilidade,
        viabilidadeClass
    };
}

// Função para calcular viabilidade de energia hidrelétrica (micro-hidro)
function calcularViabilidadeHidro(kwh, tarifa, estado, custoAnual) {
    const potencial = potencialHidroPorEstado[estado] || 5;
    const nomeEstado = nomesEstados[estado] || estado;

    // Potência estimada da micro-turbina (kW) - muito localizado
    const potenciaTurbina = Math.max(0.5, (potencial / 10) * (kwh / 500));

    // Custo estimado (R$ 15000-25000 por kW para micro-hidro)
    const custoPorKw = 20000;
    const custoInstalacao = potenciaTurbina * custoPorKw;

    // Economia anual (80% da conta)
    const economiaAnual = custoAnual * 0.8;
    const payback = custoInstalacao / economiaAnual;

    const { viabilidade, viabilidadeClass } = classificarViabilidade(payback);

    return {
        fonte: 'hidro',
        metrica1: potencial,
        metrica1Label: 'Potencial Hidrelétrico',
        metrica1Unidade: '/10',
        metrica2: potenciaTurbina,
        metrica2Label: 'Potência da Turbina',
        metrica2Unidade: 'kW',
        custoInstalacao,
        economiaAnual,
        payback,
        viabilidade,
        viabilidadeClass
    };
}

// Função para calcular viabilidade de bioenergia (biodigestor/biomassa)
function calcularViabilidadeBio(kwh, tarifa, estado, custoAnual) {
    const potencial = potencialBioPorEstado[estado] || 5;
    const nomeEstado = nomesEstados[estado] || estado;

    // Capacidade estimada do sistema (kW) - baseada em biodigestor/biomassa
    const capacidadeSistema = Math.max(1, (potencial / 10) * (kwh / 400));

    // Custo estimado (R$ 8000-12000 por kW)
    const custoPorKw = 10000;
    const custoInstalacao = capacidadeSistema * custoPorKw;

    // Economia anual (75% da conta)
    const economiaAnual = custoAnual * 0.75;
    const payback = custoInstalacao / economiaAnual;

    const { viabilidade, viabilidadeClass } = classificarViabilidade(payback);

    return {
        fonte: 'bio',
        metrica1: potencial,
        metrica1Label: 'Potencial Biomassa',
        metrica1Unidade: '/10',
        metrica2: capacidadeSistema,
        metrica2Label: 'Capacidade do Sistema',
        metrica2Unidade: 'kW',
        custoInstalacao,
        economiaAnual,
        payback,
        viabilidade,
        viabilidadeClass
    };
}

// Função auxiliar para classificar viabilidade
function classificarViabilidade(payback) {
    if (payback <= 5) {
        return { viabilidade: 'Alta', viabilidadeClass: 'alta' };
    } else if (payback <= 7) {
        return { viabilidade: 'Média', viabilidadeClass: 'media' };
    } else if (payback <= 10) {
        return { viabilidade: 'Baixa', viabilidadeClass: 'baixa' };
    } else {
        return { viabilidade: 'Não recomendada', viabilidadeClass: 'nao-recomendada' };
    }
}

// Função para exibir análise de viabilidade genérica
function exibirAnaliseViabilidade(analise, nomeFonte) {
    const container = document.getElementById('analise-viabilidade');
    const titulo = document.getElementById('titulo-viabilidade');

    // Atualizar título
    titulo.textContent = `Análise de Viabilidade - ${nomeFonte}`;

    // Atualizar classes de cor conforme a fonte
    container.className = `analise-viabilidade fonte-${analise.fonte}`;

    // Atualizar labels e valores das métricas
    document.getElementById('label-metrica-1').textContent = analise.metrica1Label;
    document.getElementById('res-metrica-1').textContent = `${analise.metrica1.toFixed(1)} ${analise.metrica1Unidade}`;

    document.getElementById('label-metrica-2').textContent = analise.metrica2Label;
    document.getElementById('res-metrica-2').textContent = `${analise.metrica2.toFixed(1)} ${analise.metrica2Unidade}`;

    document.getElementById('res-custo-instalacao').textContent = `R$ ${analise.custoInstalacao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('res-economia-anual').textContent = `R$ ${analise.economiaAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('res-payback').textContent = `${analise.payback.toFixed(1)} anos`;

    const viabilidadeEl = document.getElementById('res-viabilidade');
    viabilidadeEl.textContent = analise.viabilidade;
    viabilidadeEl.className = `viabilidade-value viabilidade-${analise.viabilidadeClass}`;

    // Exibir/ocultar métricas extras conforme disponibilidade
    const cardExtra1 = document.getElementById('card-extra-1');
    const cardExtra2 = document.getElementById('card-extra-2');
    const cardExtra3 = document.getElementById('card-extra-3');

    if (analise.geracaoAnual !== undefined) {
        document.getElementById('label-extra-1').textContent = 'Geração Anual Est.';
        document.getElementById('res-extra-1').textContent = `${(analise.geracaoAnual / 1000).toFixed(1)} MWh`;
        cardExtra1.classList.remove('hidden');
    } else {
        cardExtra1.classList.add('hidden');
    }

    if (analise.coberturaPercent !== undefined) {
        document.getElementById('label-extra-2').textContent = 'Redução da Conta';
        document.getElementById('res-extra-2').textContent = `${analise.coberturaPercent.toFixed(0)}%`;
        cardExtra2.classList.remove('hidden');
    } else {
        cardExtra2.classList.add('hidden');
    }

    if (analise.economia25anos !== undefined) {
        document.getElementById('label-extra-3').textContent = 'Economia Líq. (25 anos)';
        const valor25 = analise.economia25anos;
        const sinal = valor25 >= 0 ? '' : '-';
        document.getElementById('res-extra-3').textContent = `${sinal}R$ ${Math.abs(valor25).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        cardExtra3.classList.remove('hidden');
    } else {
        cardExtra3.classList.add('hidden');
    }

    container.classList.remove('hidden');
}

// Função para gerar diagnóstico personalizado
function gerarDiagnostico(kwh, consumoPorPessoa, fonte, custoMensal, melhorFonteRecomendada) {
    const diagnostico = {
        texto: '',
        recomendacoes: []
    };

    // Avaliação do consumo por pessoa
    if (consumoPorPessoa < 100) {
        diagnostico.texto = 'Seu consumo por pessoa é muito baixo (< 100 kWh/mês), o que é excelente! Você já tem hábitos eficientes de consumo de energia.';
        diagnostico.recomendacoes.push('Mantenha seus hábitos atuais de economia de energia');
    } else if (consumoPorPessoa < 150) {
        diagnostico.texto = 'Seu consumo por pessoa está dentro da média brasileira (100-150 kWh/mês). Há espaço para pequenas melhorias.';
        diagnostico.recomendacoes.push('Substitua lâmpadas incandescentes por LED');
        diagnostico.recomendacoes.push('Desligue aparelhos em standby quando não estiverem em uso');
    } else if (consumoPorPessoa < 250) {
        diagnostico.texto = 'Seu consumo por pessoa está acima da média (150-250 kWh/mês). Considere revisar seus hábitos e equipamentos.';
        diagnostico.recomendacoes.push('Avalie a eficiência energética de seus eletrodomésticos');
        diagnostico.recomendacoes.push('Use o ar condicionado de forma consciente (24-26°C)');
        diagnostico.recomendacoes.push('Reduza o tempo do chuveiro elétrico');
        diagnostico.recomendacoes.push('Considere instalar um sistema solar fotovoltaico');
    } else {
        diagnostico.texto = 'Seu consumo por pessoa é alto (> 250 kWh/mês). Há oportunidades significativas de economia.';
        diagnostico.recomendacoes.push('Faça uma auditoria energética completa da residência');
        diagnostico.recomendacoes.push('Substitua equipamentos antigos por modelos com selo Procel A');
        diagnostico.recomendacoes.push('Instale sistema solar fotovoltaico - altamente recomendado');
        diagnostico.recomendacoes.push('Use timer em chuveiros e aquecedores');
        diagnostico.recomendacoes.push('Otimize o uso de máquinas de lavar e secar');
    }

    // Recomendações baseadas na fonte de energia atual
    if (fonte === 'convencional') {
        diagnostico.recomendacoes.push('Considere mudar para energia renovável para reduzir emissões de CO₂');
    }

    // Recomendações baseadas na melhor fonte recomendada
    if (melhorFonteRecomendada === 'solar') {
        diagnostico.recomendacoes.push('A energia solar é a melhor opção para sua região - considere instalar painéis fotovoltaicos');
    } else if (melhorFonteRecomendada === 'eolica') {
        diagnostico.recomendacoes.push('A energia eólica é a melhor opção para sua região - avalie a instalação de pequenas turbinas');
    } else if (melhorFonteRecomendada === 'hidro') {
        diagnostico.recomendacoes.push('A micro-hidroeletricidade é viável para sua região - consulte especialistas sobre seu terreno');
    } else if (melhorFonteRecomendada === 'bio') {
        diagnostico.recomendacoes.push('A bioenergia é a melhor opção para sua região - avalie a produção de biomassa ou biodigestor');
    }

    // Recomendações baseadas no custo mensal
    if (custoMensal > 500) {
        diagnostico.recomendacoes.push(`Com seu alto custo mensal, a energia ${nomesFontes[melhorFonteRecomendada].toLowerCase()} pode ter retorno em poucos anos`);
    }

    return diagnostico;
}

// Função para exibir diagnóstico
function exibirDiagnostico(diagnostico) {
    document.getElementById('res-diagnostico-text').textContent = diagnostico.texto;

    const listaRecomendacoes = document.getElementById('lista-recomendacoes');
    listaRecomendacoes.innerHTML = '';
    diagnostico.recomendacoes.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        listaRecomendacoes.appendChild(li);
    });
}

// Função para determinar a melhor fonte de energia renovável
function determinarMelhorFonte(kwh, tarifa, estado) {
    const fontesRenovaveis = ['solar', 'eolica', 'hidro', 'bio'];
    let melhorFonte = '';
    let menorEmissao = Infinity;
    let pontuacao = {};

    fontesRenovaveis.forEach(fonte => {
        const emissao = fatoresCO2[fonte];
        const custo = kwh * 12 * tarifa;

        // Pontuação baseada em emissão de CO2 (menor é melhor)
        let pontos = (100 - (emissao * 1000));

        // Pontuação extra para solar se estado tiver boa irradiação
        if (fonte === 'solar' && estado) {
            const irradiacao = irradiacaoSolarPorEstado[estado] || 5.0;
            pontos += irradiacao * 5;
        }

        // Pontuação extra para hidro (fonte principal do Brasil)
        if (fonte === 'hidro') {
            pontos += 15;
        }

        // Pontuação extra para eólica em estados do Nordeste
        if (fonte === 'eolica' && estado) {
            const estadosNordeste = ['CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA', 'PI', 'MA'];
            if (estadosNordeste.includes(estado)) {
                pontos += 20;
            }
        }

        pontuacao[fonte] = pontos;

        if (emissao < menorEmissao) {
            menorEmissao = emissao;
        }
    });

    // Encontrar a fonte com maior pontuação
    let maiorPontuacao = -Infinity;
    fontesRenovaveis.forEach(fonte => {
        if (pontuacao[fonte] > maiorPontuacao) {
            maiorPontuacao = pontuacao[fonte];
            melhorFonte = fonte;
        }
    });

    return {
        fonte: melhorFonte,
        nome: nomesFontes[melhorFonte],
        emissao: fatoresCO2[melhorFonte],
        justificativa: gerarJustificativa(melhorFonte, estado)
    };
}

// Função para gerar justificativa da recomendação
function gerarJustificativa(fonte, estado) {
    const justificativas = {
        solar: 'A energia solar é altamente recomendada devido à baixa emissão de CO₂ e ao alto potencial de geração no Brasil',
        eolica: 'A energia eólica é excelente opção com emissão quase nula de CO₂ e grande potencial de crescimento',
        hidro: 'A energia hidrelétrica é a fonte principal do Brasil, com baixa emissão e alta capacidade instalada',
        bio: 'A bioenergia é uma opção renovável que utiliza resíduos orgânicos, contribuindo para a economia circular'
    };

    let justificativa = justificativas[fonte];

    if (fonte === 'solar' && estado) {
        const irradiacao = irradiacaoSolarPorEstado[estado];
        if (irradiacao >= 5.5) {
            justificativa += `. Seu estado (${nomesEstados[estado]}) possui excelente irradiação solar (${irradiacao} kWh/m²/dia)`;
        } else if (irradiacao >= 5.0) {
            justificativa += `. Seu estado possui boa irradiação solar (${irradiacao} kWh/m²/dia)`;
        }
    }

    if (fonte === 'eolica' && estado) {
        const estadosNordeste = ['CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA', 'PI', 'MA'];
        if (estadosNordeste.includes(estado)) {
            justificativa += `. O Nordeste brasileiro possui grande potencial eólico`;
        }
    }

    return justificativa;
}

// Função para exibir recomendação
function exibirRecomendacao(recomendacao) {
    const recomendacaoEl = document.getElementById('recomendacao-fonte');
    if (recomendacaoEl) {
        recomendacaoEl.classList.remove('hidden');
        document.getElementById('res-melhor-fonte').textContent = recomendacao.nome;
        document.getElementById('res-justificativa').textContent = recomendacao.justificativa;
        document.getElementById('res-emissao-fonte').textContent = `${recomendacao.emissao} kg CO₂/kWh`;
    }
}

// FALLING LEAVES ON SCROLL
(function () {
    const container = document.getElementById('leaves-container');
    const hero = document.querySelector('.hero');
    if (!container || !hero) return;

    const leafTypes = ['leaf-a', 'leaf-b', 'leaf-c', 'leaf-d'];
    const MAX_LEAVES = 60;
    let activeLeaves = 0;
    let lastScrollY = window.scrollY;
    let scrollAccum = 0;
    let rafPending = false;

    function spawnLeaf(intensity) {
        if (activeLeaves >= MAX_LEAVES) return;
        const leaf = document.createElement('span');
        const type = leafTypes[Math.floor(Math.random() * leafTypes.length)];
        leaf.className = 'leaf ' + type;

        const size = 18 + Math.random() * 28;
        const startX = Math.random() * 100;
        const duration = 3 + Math.random() * 3.5;
        const delay = Math.random() * 0.4;
        const drift = (Math.random() - 0.5) * 200;

        leaf.style.left = startX + '%';
        leaf.style.width = size + 'px';
        leaf.style.height = size + 'px';
        leaf.style.animationDuration = duration + 's';
        leaf.style.animationDelay = delay + 's';
        leaf.style.setProperty('--drift', drift + 'px');

        const sway = 1.5 + Math.random() * 2;
        leaf.style.animation = `leafFall ${duration}s linear ${delay}s forwards, leafSway ${sway}s ease-in-out ${delay}s infinite`;

        container.appendChild(leaf);
        activeLeaves++;

        const total = (duration + delay) * 1000 + 200;
        setTimeout(() => {
            leaf.remove();
            activeLeaves--;
        }, total);
    }

    function onScroll() {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;
        lastScrollY = currentY;

        const heroHeight = hero.offsetHeight;
        // Active when scrolling within and just past the hero
        if (currentY > heroHeight * 1.2) return;
        if (delta <= 0) return;

        scrollAccum += delta;

        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(() => {
                rafPending = false;
                // Progress 0 (top) -> 1 (bottom of hero) — leaves intensify near the bottom
                const progress = Math.min(1, currentY / heroHeight);
                const baseRate = 1 + Math.floor(progress * 4);
                const burst = Math.min(6, Math.floor(scrollAccum / 40) * baseRate);
                for (let i = 0; i < burst; i++) {
                    spawnLeaf(progress);
                }
                if (scrollAccum > 40) scrollAccum = 0;
            });
        }
    }

    // Initial gentle drift so the transition feels alive on page load
    function initialDrift() {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => spawnLeaf(0.2), i * 600);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    initialDrift();
})();

// HERO PARALLAX + SCROLL TRANSITION
(function () {
    const hero = document.querySelector('.hero');
    const overlay = document.querySelector('.hero-overlay');
    const forest = document.querySelector('.hero-forest');
    const heroBefore = document.querySelector('.hero');
    const indicator = document.querySelector('.scroll-indicator');
    if (!hero || !overlay) return;

    let ticking = false;

    function update() {
        const y = window.scrollY;
        const h = window.innerHeight;
        const progress = Math.min(1, Math.max(0, y / h));

        // Hero content fades, lifts and zooms slightly as user scrolls past it
        overlay.style.transform = `translateY(${y * 0.35}px) scale(${1 - progress * 0.08})`;
        overlay.style.opacity = String(1 - progress * 1.2);

        // Forest layer parallax — moves slower than the scroll
        if (forest) {
            forest.style.transform = `translateY(${y * 0.3}px) scale(${1 + progress * 0.08})`;
        }

        // Scroll indicator fades out quickly
        if (indicator) {
            indicator.style.opacity = String(Math.max(0, 1 - progress * 3));
            indicator.style.pointerEvents = progress > 0.2 ? 'none' : 'auto';
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
})();

// NAV STATE + SCROLL PROGRESS
(function () {
    const nav = document.getElementById('nav');
    const bar = document.getElementById('scroll-progress');

    function onScroll() {
        const y = window.scrollY;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? (y / h) * 100 : 0;

        if (bar) bar.style.width = pct + '%';
        if (nav) nav.classList.toggle('nav-scrolled', y > window.innerHeight * 0.6);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// REVEAL ON SCROLL
(function () {
    const items = document.querySelectorAll('.reveal');
    if (!items.length || !('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('is-visible'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    items.forEach((el) => io.observe(el));
})();