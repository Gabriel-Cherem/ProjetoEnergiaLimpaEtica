# EcoEnergia - Energia Renovável e Limpa

> **Site educativo interativo** para calcular o consumo de energia elétrica, comparar fontes renováveis e analisar a viabilidade de investimento em energia limpa para cada região do Brasil.

---

## Objetivo

O EcoEnergia é uma ferramenta educativa que tem como propósito:

- **Conscientizar** sobre os tipos de energia renovável e suas vantagens ambientais.
- **Calcular** o custo real do consumo de energia elétrica da residência do usuário.
- **Recomendar** a melhor fonte de energia renovável para o estado brasileiro informado.
- **Analisar a viabilidade financeira** da fonte recomendada, estimando investimento, payback e economia a longo prazo.
- **Comparar visualmente** o custo e a emissão de CO₂ entre todas as fontes de energia disponíveis.

---

## Estrutura do Projeto

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Estrutura da página, formulário, seções de resultados e layout |
| `style.css` | Estilização visual, animações, cards, responsividade e temas por fonte |
| `script.js` | Lógica completa: cálculos, recomendação, viabilidade e gráficos |

---

## 1. Calculadora de Gastos de Energia

O usuário informa: **consumo mensal (kWh)**, **tarifa (R$/kWh)**, **número de moradores**, **fonte atual** e **estado (UF)**.

### 1.1 Cálculos Básicos

```
Custo Mensal    = kWh × tarifa
Custo Anual     = Custo Mensal × 12
Consumo/Pessoa  = kWh / pessoas

CO₂ Emitido/Ano = kWh × 12 × fatorCO₂[fonte]
CO₂ Evitado/Ano = kWh × 12 × (fatorCO₂[convencional] - fatorCO₂[fonte])
```

### 1.2 Fatores de Emissão de CO₂ (kg CO₂ / kWh)

| Fonte | Fator |
|-------|-------|
| Convencional | 0.10 |
| Solar | 0.02 |
| Eólica | 0.01 |
| Hidrelétrica | 0.02 |
| Bioenergia | 0.03 |

> O valor de CO₂ evitado é calculado comparando a fonte escolhida com a matriz convencional brasileira (~0.1 kg CO₂/kWh).

---

## 2. Recomendação de Fonte de Energia Renovável

O sistema avalia automaticamente qual fonte renovável é mais indicada para o estado do usuário.

### 2.1 Pontuação das Fontes

Para cada fonte renovável (`solar`, `eólica`, `hidro`, `bio`), é atribuída uma pontuação baseada em:

1. **Base por emissão de CO₂** (menor emissão = mais pontos):
   ```
   pontosBase = 100 - (emissão × 1000)
   ```

2. **Bônus Solar** — se o estado tiver boa irradiação:
   ```
   pontos += irradiacao × 5
   ```

3. **Bônus Hidro** — por ser a matriz principal do Brasil:
   ```
   pontos += 15
   ```

4. **Bônus Eólica** — para estados do Nordeste (`CE`, `RN`, `PB`, `PE`, `AL`, `SE`, `BA`, `PI`, `MA`):
   ```
   pontos += 20
   ```

5. **Vencedor**: a fonte com a maior pontuação é recomendada.

### 2.2 Justificativa da Recomendação

Um texto explicativo é gerado de acordo com a fonte vencedora e dados específicos do estado (irradiação solar ou potencial eólico do Nordeste).

---

## 3. Análise de Viabilidade Financeira

Após determinar a **melhor fonte recomendada**, o sistema calcula a viabilidade financeira dessa fonte especificamente para o estado do usuário.

### 3.1 Dispatcher de Fontes

```js
switch (fonteRecomendada) {
  case 'solar':  calcularViabilidadeSolar(...);
  case 'eolica': calcularViabilidadeEolica(...);
  case 'hidro':  calcularViabilidadeHidro(...);
  case 'bio':    calcularViabilidadeBio(...);
}
```

A interface (título, cores, labels e métricas) se adapta dinamicamente à fonte calculada.

---

### 3.2 Viabilidade Solar (Modelo Realista)

#### Passo 1: Potência do Sistema (kWp)

```
Performance Ratio (PR) = 0.80
  → Considera perdas reais: temperatura, sujeira, inversor,
    cabeamento, mismatch e sombreamento.

Potência Necessária (kWp) = kWh / (irradiacao × 30 × PR)
Potência do Sistema (kWp) = arredondar para múltiplo de 0.5
```

#### Passo 2: Custo de Instalação

O custo por kWp varia conforme o tamanho do sistema (escala de mercado real no Brasil):

| Tamanho do Sistema | Custo por kWp |
|--------------------|---------------|
| < 2 kWp | R$ 5.500 |
| 2 — 5 kWp | R$ 4.500 |
| 5 — 10 kWp | R$ 4.000 |
| ≥ 10 kWp | R$ 3.500 |

```
Custo Instalação = Potência do Sistema × custoPorKwp
```

#### Passo 3: Geração e Cobertura Real

```
Geração Anual (kWh)  = Potência × Irradiação × 365 × PR
Geração Mensal (kWh) = Geração Anual / 12

Cobertura da Conta (%) = min(Geração Mensal / Consumo Mensal, 95%)
```

> O teto de 95% existe porque a concessionária cobra um **valor mínimo de conta** (~R$ 50/mês) mesmo com compensação solar.

#### Passo 4: Economia Anual Líquida

```
Economia Bruta Anual = Cobertura × Custo Anual

Manutenção Anual     = Custo Instalação × 1.5%
  → Limpeza de painéis, revisão elétrica, seguro

Mínimo Concessionária = R$ 50/mês × 12 = R$ 600/ano

Economia Anual Líquida = Economia Bruta - Manutenção - Mínimo Concessionária
```

#### Passo 5: Payback

```
Payback (anos) = Custo Instalação / Economia Anual Líquida
```

> Se a economia for negativa ou zero, o payback é definido como 999 anos (viabilidade "Não recomendada").

#### Passo 6: Economia em 25 Anos (Vida Útil dos Painéis)

```
Degradação dos painéis = 0.5% ao ano

Para cada ano de 1 a 25:
  Fator de Degradação = (1 - 0.005)^(ano - 1)
  Economia do Ano = Economia Bruta × FatorDegradação
                  - Manutenção - Mínimo Concessionária

Economia Acumulada = Σ(Economia do Ano) para 25 anos
```

#### Passo 7: Custos Adicionais ao Longo do Tempo

```
Troca do Inversor (ano ~12) = Custo Instalação × 15%

Economia Líquida 25 Anos = Economia Acumulada
                          - Custo Instalação
                          - Troca do Inversor

ROI 25 Anos (%) = (Economia Líquida 25 Anos / Custo Instalação) × 100
```

#### Métricas Exibidas (apenas para Solar)

| Card | Descrição |
|------|-----------|
| Irradiação Solar | kWh/m²/dia do estado |
| Potência do Sistema | kWp necessários |
| Custo Estimado Instalação | Valor total do investimento |
| Economia Anual Estimada | Líquida, já com descontos |
| Payback | Tempo para recuperar o investimento |
| Viabilidade | Alta / Média / Baixa / Não recomendada |
| Geração Anual Est. | Total gerado em MWh/ano |
| Redução da Conta | % que o solar cobre da conta |
| Economia Líq. (25 anos) | Lucro líquido ao longo da vida útil |

#### Classificação de Viabilidade

| Payback | Viabilidade |
|---------|-------------|
| ≤ 5 anos | **Alta** |
| ≤ 7 anos | **Média** |
| ≤ 10 anos | **Baixa** |
| > 10 anos | **Não recomendada** |

---

### 3.3 Viabilidade Eólica

```
Velocidade do Vento (m/s) = dados por estado

Fator de Capacidade:
  vento ≥ 7 m/s  → 35%
  vento ≥ 5 m/s  → 25%
  vento ≥ 3.5 m/s → 18%
  vento < 3.5 m/s → 15%

Potência da Turbina (kW) = max(1, ceil(kWh / (720 × FatorCapacidade)))
Custo Instalação = Potência × R$ 10.000
Economia Anual   = Custo Anual × 85%
Payback = Custo Instalação / Economia Anual
```

**Métricas exibidas:** Velocidade do Vento (m/s) e Potência da Turbina (kW).

---

### 3.4 Viabilidade Hidrelétrica (Micro-Hidro)

```
Potencial Hidro (1-10) = dados por estado

Potência da Turbina (kW) = max(0.5, (Potencial/10) × (kWh/500))
Custo Instalação = Potência × R$ 20.000
Economia Anual   = Custo Anual × 80%
Payback = Custo Instalação / Economia Anual
```

**Métricas exibidas:** Potencial Hidrelétrico (/10) e Potência da Turbina (kW).

> Nota: a viabilidade hidrelétrica é altamente dependente do terreno (queda d'água), por isso o potencial é um indicador regional aproximado.

---

### 3.5 Viabilidade de Bioenergia (Biomassa / Biodigestor)

```
Potencial Biomassa (1-10) = dados por estado (baseado em agronegócio)

Capacidade do Sistema (kW) = max(1, (Potencial/10) × (kWh/400))
Custo Instalação = Capacidade × R$ 10.000
Economia Anual   = Custo Anual × 75%
Payback = Custo Instalação / Economia Anual
```

**Métricas exibidas:** Potencial Biomassa (/10) e Capacidade do Sistema (kW).

---

## 4. Gráfico Comparativo

Um gráfico de barras (`Chart.js`) compara todas as fontes de energia:

- **Eixo Y esquerdo:** Custo Anual (R$) — cor verde
- **Eixo Y direito:** Emissão de CO₂ Anual (kg) — cor vermelha tracejada

O custo é o mesmo para todas as fontes (baseado no consumo do usuário), mas a emissão de CO₂ varia conforme o fator de cada fonte.

```
Custo Anual  = kWh × 12 × tarifa
Emissão Anual = kWh × 12 × fatorCO₂[fonte]
```

As cores do gráfico correspondem às cores temáticas de cada fonte:

| Fonte | Cor |
|-------|-----|
| Convencional | Vermelho `#e53935` |
| Solar | Amarelo `#f9a825` |
| Eólica | Azul claro `#4fc3f7` |
| Hidrelétrica | Azul `#0288d1` |
| Bioenergia | Verde `#66bb6a` |

---

## 5. Diagnóstico Personalizado

Baseado no consumo por pessoa, uma análise textual é gerada com recomendações práticas de economia de energia e dicas sobre a melhor fonte renovável para a região.

| Consumo/Pessoa | Classificação | Recomendações |
|----------------|---------------|---------------|
| < 100 kWh | Excelente | Manter hábitos atuais |
| 100 — 150 kWh | Média brasileira | Substituir por LED, desligar standby |
| 150 — 250 kWh | Acima da média | Eficiência de eletrodomésticos, ar-condicionado |
| > 250 kWh | Alto | Auditoria energética, instalação de renováveis |

Além disso, o diagnóstico inclui uma recomendação específica sobre a **melhor fonte renovável** calculada pelo sistema.

---

## 6. Dados por Estado (Brasil)

### Irradiação Solar (kWh/m²/dia)

| Estado | Valor | Estado | Valor | Estado | Valor |
|--------|-------|--------|-------|--------|-------|
| CE, RN | 5.8 | MT, SE | 5.3 | ES | 4.8 |
| BA, PE, MA | 5.6 | DF, GO, TO | 5.4 | RO, RJ | 4.7 |
| PB, PI | 5.7 | AL, MS | 5.2 | PR, RR | 4.6 |
| MG | 5.1 | SP | 4.9 | SC, AC | 4.5 |
| | | | | AM, AP | 4.2-4.3 |

> Estados como **Ceará, Rio Grande do Norte, Paraíba** possuem a maior irradiação. **Amazonas e Amapá** têm a menor.

### Velocidade do Vento (m/s)

| Região | Estados | Valor |
|--------|---------|-------|
| Alto Nordeste | RN, CE, PB, PE, AL, SE | 6.5 — 7.5 m/s |
| Nordeste médio | BA, PI, MA | 5.8 — 6.5 m/s |
| Sul | RS, SC, PR | 4.5 — 5.2 m/s |
| Sudeste / Centro-Oeste | MG, SP, RJ, GO, DF, MT, MS | 4.0 — 4.8 m/s |
| Norte / baixo | AC, AM, AP, PA, RR | 2.8 — 3.5 m/s |

### Potencial Hidrelétrico (1-10)

| Alto | Médio-Alto | Médio | Baixo |
|------|------------|-------|-------|
| PA (10), AM (9) | MT (8), MG (8), PR (7), RO (7), SC (7) | AC, MA, RJ, RS, SP, TO (6) | AL, CE, DF, PB, RN, SE (2-3) |

### Potencial de Biomassa (1-10)

| Alto | Médio-Alto | Médio | Baixo |
|------|------------|-------|-------|
| MT (10), MS (9), GO (9), PR (9) | MG (8), RS (8), BA (8) | MA (7), PE (7), PI (7), SC (7) | AP (3), RR (3), DF (3) |

---

## 7. Tecnologias Utilizadas

- **HTML5** — estrutura semântica e acessibilidade
- **CSS3** — design responsivo, animações, gradientes e efeitos visuais
- **JavaScript (Vanilla)** — toda a lógica de cálculos e interatividade
- **Chart.js 4.4.7** — gráficos comparativos de custo e emissão
- **Leaflet 1.9.4** — mapa interativo (se aplicável)
- **Fonte de ícones** — flaticon.com

---

## 8. Como Usar

1. Abra o arquivo `index.html` em qualquer navegador moderno.
2. Na seção **Calculadora**, preencha:
   - Consumo mensal (kWh) — consulte sua conta de luz
   - Tarifa (R$/kWh) — consulte sua conta de luz
   - Número de moradores
   - Fonte de energia atual
   - **Estado brasileiro** (essencial para a análise de viabilidade)
3. Clique em **Calcular**.
4. O sistema exibirá:
   - Resultados financeiros e de CO₂
   - **Recomendação da melhor fonte renovável**
   - **Análise de viabilidade financeira** da fonte recomendada
   - Diagnóstico personalizado com dicas de economia
   - Gráfico comparativo entre todas as fontes

---

## 9. Limitações e Observações

- Os valores de **custo de instalação** são estimados de mercado brasileiro (2024/2025) e podem variar significativamente conforme a região, o profissional instalador e a qualidade dos equipamentos.
- A análise de **viabilidade hidrelétrica** é altamente dependente do terreno individual (presença de queda d'água), sendo o potencial estadual apenas um indicador regional.
- A **economia anual** considera a compensação de energia via sistema de **net metering**, que é a modalidade vigente no Brasil para sistemas residenciais.
- O **mínimo da concessionária** (~R$ 50/mês) é uma média nacional; o valor real varia por distribuidora.
- A **troca do inversor** é estimada no ano 12, mas pode ocorrer entre 10 e 15 anos dependendo da qualidade do equipamento.
- A **degradação dos painéis** de 0,5% ao ano é um valor conservador e realista para painéis de qualidade.

---

Desenvolvido por Gabriel Cherem, Noah, Kaique, Maria e Amanda.
