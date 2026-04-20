/**
 * CALCULADORA DE CÁLCULO MULTIVARIADO
 * Aplicación interactiva para visualización y cálculo de funciones de múltiples variables
 * 
 * @author Proyecto Final - Ingeniería de Software
 * @version 1.0.0
 */

// =====================================================
// FUNCIONES DE NAVEGACIÓN Y UI
// =====================================================

/**
 * Cambia entre pestañas de la aplicación
 * @param {Event} evt - Evento del click
 * @param {string} tabName - Nombre de la pestaña a mostrar
 */
function openTab(evt, tabName) {
    // Ocultar todos los contenidos de pestañas
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remover la clase active de todas las pestañas
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    // Mostrar el contenido actual y marcar la pestaña como activa
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

/**
 * Establece una función de ejemplo en el campo de entrada
 * @param {string} type - Tipo de campo (viz, dom, der, grad, int, app)
 * @param {string} func - Función a establecer
 */
function setFunction(type, func) {
    document.getElementById(`function-${type}`).value = func;
}

/**
 * Establece ejemplos de optimización predefinidos
 * @param {number} example - Número del ejemplo (1, 2, 3)
 */
function setOptimizationExample(example) {
    const examples = {
        1: {
            objective: 'x * y',
            constraint: 'x^2 + y^2 - 1'
        },
        2: {
            objective: 'x^2 + y^2',
            constraint: 'x + y - 1'
        },
        3: {
            objective: 'x^2 + 2*y^2',
            constraint: '2*x + y - 4'
        }
    };

    if (examples[example]) {
        document.getElementById('function-opt').value = examples[example].objective;
        document.getElementById('constraint-opt').value = examples[example].constraint;
    }
}

// =====================================================
// FUNCIONES DE UTILIDAD MATEMÁTICA
// =====================================================

/**
 * Parsea una expresión matemática usando Math.js
 * @param {string} expr - Expresión a parsear
 * @returns {Object} - Objeto expresión de Math.js
 * @throws {Error} - Si hay error al parsear
 */
function parseExpression(expr) {
    try {
        return math.parse(expr);
    } catch (error) {
        throw new Error(`Error al parsear la expresión: ${error.message}`);
    }
}

/**
 * Evalúa una función en un punto (x, y)
 * @param {string} expr - Expresión matemática
 * @param {number} x - Coordenada x
 * @param {number} y - Coordenada y
 * @returns {number} - Resultado de la evaluación
 */
function evaluateFunction(expr, x, y) {
    try {
        const compiled = math.compile(expr);
        return compiled.evaluate({ x: x, y: y });
    } catch (error) {
        return NaN;
    }
}

/**
 * Muestra un mensaje de error en un elemento
 * @param {string} elementId - ID del elemento donde mostrar el error
 * @param {string} message - Mensaje de error
 */
function showError(elementId, message) {
    document.getElementById(elementId).innerHTML = `
        <div class="error-box">
            <strong>⚠️ Error:</strong> ${message}
        </div>
    `;
}

// =====================================================
// TAB 1: VISUALIZACIÓN 3D DE FUNCIONES
// =====================================================

/**
 * Visualiza una superficie 3D de una función de dos variables
 */
function visualize3D() {
    try {
        const funcStr = document.getElementById('function-viz').value;
        const xRange = document.getElementById('x-range-viz').value.split(',').map(Number);
        const yRange = document.getElementById('y-range-viz').value.split(',').map(Number);

        if (xRange.length !== 2 || yRange.length !== 2) {
            throw new Error('Los rangos deben tener formato: min, max');
        }

        const [xMin, xMax] = xRange;
        const [yMin, yMax] = yRange;
        const steps = 50;

        // Generar malla de puntos
        const xValues = [];
        const yValues = [];
        const zValues = [];

        for (let i = 0; i < steps; i++) {
            const x = xMin + (xMax - xMin) * i / (steps - 1);
            xValues.push(x);
            yValues.push(yMin + (yMax - yMin) * i / (steps - 1));
        }

        // Calcular valores z
        for (let i = 0; i < steps; i++) {
            const row = [];
            for (let j = 0; j < steps; j++) {
                const z = evaluateFunction(funcStr, xValues[j], yValues[i]);
                row.push(z);
            }
            zValues.push(row);
        }

        // Crear gráfica 3D
        const data = [{
            type: 'surface',
            x: xValues,
            y: yValues,
            z: zValues,
            colorscale: 'Viridis',
            showscale: true,
            contours: {
                z: {
                    show: true,
                    usecolormap: true,
                    highlightcolor: "#42f462",
                    project: { z: true }
                }
            }
        }];

        const layout = {
            title: `Superficie: z = ${funcStr}`,
            autosize: true,
            scene: {
                xaxis: { title: 'x' },
                yaxis: { title: 'y' },
                zaxis: { title: 'z' },
                camera: {
                    eye: { x: 1.5, y: 1.5, z: 1.3 }
                }
            },
            margin: { l: 0, r: 0, b: 0, t: 40 }
        };

        const config = { 
            responsive: true,
            displayModeBar: true,
            displaylogo: false
        };

        Plotly.newPlot('plot-3d', data, layout, config);
    } catch (error) {
        showError('plot-3d', error.message);
    }
}

// =====================================================
// TAB 2: ANÁLISIS DE DOMINIO Y RANGO
// =====================================================

/**
 * Analiza el dominio y rango de una función
 */
function analyzeDomain() {
    try {
        const funcStr = document.getElementById('function-dom').value;
        let domainDescription = '';
        let rangeDescription = '';

        // Análisis heurístico del dominio
        if (funcStr.includes('sqrt')) {
            domainDescription = 'El dominio está restringido donde el argumento de la raíz cuadrada es no negativo.';
            if (funcStr.includes('x^2') && funcStr.includes('y^2')) {
                domainDescription += ' Típicamente forma una región circular o elíptica.';
            }
        } else if (funcStr.includes('log')) {
            domainDescription = 'El dominio está restringido donde el argumento del logaritmo es positivo.';
        } else if (funcStr.includes('/')) {
            domainDescription = 'El dominio excluye los puntos donde el denominador es cero.';
        } else {
            domainDescription = 'El dominio es todo ℝ² (todos los pares (x,y) reales).';
        }

        // Análisis numérico del rango
        const testPoints = [];
        for (let x = -5; x <= 5; x += 0.5) {
            for (let y = -5; y <= 5; y += 0.5) {
                const z = evaluateFunction(funcStr, x, y);
                if (!isNaN(z) && isFinite(z)) {
                    testPoints.push(z);
                }
            }
        }

        if (testPoints.length > 0) {
            const minZ = Math.min(...testPoints);
            const maxZ = Math.max(...testPoints);
            rangeDescription = `Rango estimado: [${minZ.toFixed(3)}, ${maxZ.toFixed(3)}]`;
            
            if (funcStr.includes('x^2') || funcStr.includes('y^2')) {
                rangeDescription += ' (La función tiene valores no negativos en su mayoría)';
            }
        } else {
            rangeDescription = 'No se pudo determinar el rango con los puntos de prueba.';
        }

        // Mostrar resultados
        document.getElementById('domain-result').innerHTML = `
            <div class="result-box">
                <h3>📊 Análisis de Dominio y Rango</h3>
                <p><strong>Función:</strong> f(x, y) = ${funcStr}</p>
                <hr>
                <p><strong>Dominio:</strong> ${domainDescription}</p>
                <p><strong>Rango:</strong> ${rangeDescription}</p>
                <hr>
                <p style="font-style: italic; color: #666;">
                    <strong>Nota:</strong> Este es un análisis aproximado basado en evaluación numérica. 
                    Para un análisis riguroso, se requiere estudio analítico de las restricciones.
                </p>
            </div>
        `;

        // Visualizar el dominio
        visualizeDomain(funcStr);
    } catch (error) {
        showError('domain-result', error.message);
    }
}

/**
 * Visualiza los puntos válidos del dominio de una función
 * @param {string} funcStr - Expresión de la función
 */
function visualizeDomain(funcStr) {
    try {
        const steps = 100;
        const range = 5;
        const validPoints = { x: [], y: [], z: [] };

        // Buscar puntos válidos del dominio
        for (let i = 0; i < steps; i++) {
            for (let j = 0; j < steps; j++) {
                const x = -range + (2 * range * i / steps);
                const y = -range + (2 * range * j / steps);
                const z = evaluateFunction(funcStr, x, y);
                
                if (!isNaN(z) && isFinite(z)) {
                    validPoints.x.push(x);
                    validPoints.y.push(y);
                    validPoints.z.push(z);
                }
            }
        }

        const data = [{
            type: 'scatter3d',
            mode: 'markers',
            x: validPoints.x,
            y: validPoints.y,
            z: validPoints.z,
            marker: {
                size: 2,
                color: validPoints.z,
                colorscale: 'Viridis',
                showscale: true
            },
            name: 'Puntos válidos'
        }];

        const layout = {
            title: 'Dominio de la función (puntos válidos en 3D)',
            scene: {
                xaxis: { title: 'x' },
                yaxis: { title: 'y' },
                zaxis: { title: 'z' }
            },
            margin: { l: 0, r: 0, b: 0, t: 40 }
        };

        const config = { 
            responsive: true,
            displaylogo: false
        };

        // Agregar la visualización después de los resultados
        const container = document.getElementById('domain-result');
        const plotDiv = document.createElement('div');
        plotDiv.className = 'plot-container';
        plotDiv.id = 'domain-plot-3d';
        container.appendChild(plotDiv);

        Plotly.newPlot('domain-plot-3d', data, layout, config);
    } catch (error) {
        console.error('Error en visualización del dominio:', error);
    }
}

// =====================================================
// TAB 3: DERIVADAS PARCIALES
// =====================================================

/**
 * Calcula las derivadas parciales de una función en un punto
 */
function calculatePartialDerivatives() {
    try {
        const funcStr = document.getElementById('function-der').value;
        const x0 = parseFloat(document.getElementById('x0-der').value);
        const y0 = parseFloat(document.getElementById('y0-der').value);

        const expr = math.parse(funcStr);
        
        // Calcular derivadas simbólicas
        const dfdx = math.derivative(expr, 'x');
        const dfdy = math.derivative(expr, 'y');

        // Evaluar en el punto
        const dfdx_val = dfdx.evaluate({ x: x0, y: y0 });
        const dfdy_val = dfdy.evaluate({ x: x0, y: y0 });
        const f_val = expr.evaluate({ x: x0, y: y0 });

        // Mostrar resultados
        document.getElementById('derivatives-result').innerHTML = `
            <div class="result-box">
                <h3>∂ Derivadas Parciales</h3>
                <p><strong>Función:</strong> f(x, y) = ${funcStr}</p>
                <p><strong>Punto:</strong> (${x0}, ${y0})</p>
                <hr>
                <h4>Derivadas Simbólicas:</h4>
                <p><strong>∂f/∂x =</strong> ${dfdx.toString()}</p>
                <p><strong>∂f/∂y =</strong> ${dfdy.toString()}</p>
                <hr>
                <h4>Valores en el punto (${x0}, ${y0}):</h4>
                <p><strong>f(${x0}, ${y0}) =</strong> ${f_val.toFixed(6)}</p>
                <p><strong>∂f/∂x(${x0}, ${y0}) =</strong> ${dfdx_val.toFixed(6)}</p>
                <p><strong>∂f/∂y(${x0}, ${y0}) =</strong> ${dfdy_val.toFixed(6)}</p>
                <hr>
                <h4>Interpretación Geométrica:</h4>
                <p style="font-style: italic; color: #666;">
                    • La derivada parcial ∂f/∂x = ${dfdx_val.toFixed(3)} indica que por cada unidad 
                    que aumenta x (manteniendo y = ${y0} constante), la función cambia aproximadamente 
                    ${Math.abs(dfdx_val).toFixed(3)} unidades ${dfdx_val >= 0 ? 'aumentando' : 'disminuyendo'}.<br>
                    • La derivada parcial ∂f/∂y = ${dfdy_val.toFixed(3)} indica que por cada unidad 
                    que aumenta y (manteniendo x = ${x0} constante), la función cambia aproximadamente 
                    ${Math.abs(dfdy_val).toFixed(3)} unidades ${dfdy_val >= 0 ? 'aumentando' : 'disminuyendo'}.
                </p>
            </div>
        `;
    } catch (error) {
        showError('derivatives-result', error.message);
    }
}

// =====================================================
// TAB 4: CAMPO GRADIENTE
// =====================================================

/**
 * Calcula y visualiza el gradiente de una función
 */
function calculateGradient() {
    try {
        const funcStr = document.getElementById('function-grad').value;
        const x0 = parseFloat(document.getElementById('x0-grad').value);
        const y0 = parseFloat(document.getElementById('y0-grad').value);

        const expr = math.parse(funcStr);
        const dfdx = math.derivative(expr, 'x');
        const dfdy = math.derivative(expr, 'y');

        // Evaluar gradiente en el punto
        const dfdx_val = dfdx.evaluate({ x: x0, y: y0 });
        const dfdy_val = dfdy.evaluate({ x: x0, y: y0 });
        const magnitude = Math.sqrt(dfdx_val * dfdx_val + dfdy_val * dfdy_val);

        // Calcular dirección normalizada
        const dir_x = magnitude > 0 ? dfdx_val / magnitude : 0;
        const dir_y = magnitude > 0 ? dfdy_val / magnitude : 0;

        // Mostrar resultados
        document.getElementById('gradient-result').innerHTML = `
            <div class="result-box">
                <h3>∇ Campo Gradiente</h3>
                <p><strong>Función:</strong> f(x, y) = ${funcStr}</p>
                <p><strong>Punto de evaluación:</strong> (${x0}, ${y0})</p>
                <hr>
                <h4>Gradiente Simbólico:</h4>
                <p><strong>∇f =</strong> (${dfdx.toString()}, ${dfdy.toString()})</p>
                <hr>
                <h4>Gradiente en (${x0}, ${y0}):</h4>
                <p><strong>∇f(${x0}, ${y0}) =</strong> (${dfdx_val.toFixed(6)}, ${dfdy_val.toFixed(6)})</p>
                <p><strong>Magnitud ||∇f|| =</strong> ${magnitude.toFixed(6)}</p>
                <p><strong>Dirección unitaria =</strong> (${dir_x.toFixed(6)}, ${dir_y.toFixed(6)})</p>
                <hr>
                <h4>Interpretación:</h4>
                <p style="font-style: italic; color: #666;">
                    • El gradiente apunta en la dirección de máximo crecimiento de la función.<br>
                    • La magnitud ${magnitude.toFixed(3)} indica la tasa de cambio máxima en el punto.<br>
                    • En la visualización abajo, los vectores muestran el campo gradiente sobre las curvas de nivel.
                </p>
            </div>
        `;

        // Visualizar campo gradiente
        visualizeGradientField(funcStr, x0, y0);
    } catch (error) {
        showError('gradient-result', error.message);
    }
}

/**
 * Visualiza el campo gradiente sobre curvas de nivel
 * @param {string} funcStr - Expresión de la función
 * @param {number} x0 - Coordenada x del punto
 * @param {number} y0 - Coordenada y del punto
 */
function visualizeGradientField(funcStr, x0, y0) {
    try {
        const expr = math.parse(funcStr);
        const dfdx = math.derivative(expr, 'x');
        const dfdy = math.derivative(expr, 'y');

        // Crear malla de puntos para vectores gradiente
        const steps = 15;
        const range = 3;
        const xGrid = [];
        const yGrid = [];
        const uGrid = [];
        const vGrid = [];

        for (let i = 0; i < steps; i++) {
            for (let j = 0; j < steps; j++) {
                const x = x0 - range + (2 * range * i / (steps - 1));
                const y = y0 - range + (2 * range * j / (steps - 1));
                
                const u = dfdx.evaluate({ x: x, y: y });
                const v = dfdy.evaluate({ x: x, y: y });
                
                if (!isNaN(u) && !isNaN(v) && isFinite(u) && isFinite(v)) {
                    xGrid.push(x);
                    yGrid.push(y);
                    uGrid.push(u);
                    vGrid.push(v);
                }
            }
        }

        // Crear curvas de nivel de fondo
        const contourSteps = 50;
        const contourX = [];
        const contourY = [];
        const contourZ = [];
        
        for (let i = 0; i < contourSteps; i++) {
            const row = [];
            for (let j = 0; j < contourSteps; j++) {
                const x = x0 - range + (2 * range * i / (contourSteps - 1));
                const y = y0 - range + (2 * range * j / (contourSteps - 1));
                const z = expr.evaluate({ x: x, y: y });
                row.push(z);
            }
            contourZ.push(row);
        }

        for (let i = 0; i < contourSteps; i++) {
            contourX.push(x0 - range + (2 * range * i / (contourSteps - 1)));
            contourY.push(y0 - range + (2 * range * i / (contourSteps - 1)));
        }

        // Crear trazas de Plotly
        const data = [
            {
                type: 'contour',
                x: contourX,
                y: contourY,
                z: contourZ,
                colorscale: 'Viridis',
                showscale: true,
                contours: {
                    coloring: 'heatmap',
                    showlines: true
                },
                name: 'Curvas de nivel'
            },
            {
                type: 'scatter',
                mode: 'markers',
                x: [x0],
                y: [y0],
                marker: {
                    size: 12,
                    color: 'red',
                    symbol: 'x',
                    line: { width: 2, color: 'white' }
                },
                name: 'Punto de evaluación'
            }
        ];

        // Agregar vectores gradiente
        const scale = 0.3;
        for (let i = 0; i < Math.min(xGrid.length, 100); i++) {
            data.push({
                type: 'scatter',
                mode: 'lines',
                x: [xGrid[i], xGrid[i] + uGrid[i] * scale],
                y: [yGrid[i], yGrid[i] + vGrid[i] * scale],
                line: { color: 'white', width: 2 },
                showlegend: false,
                hoverinfo: 'skip'
            });
        }

        const layout = {
            title: 'Campo Gradiente sobre Curvas de Nivel',
            xaxis: { title: 'x' },
            yaxis: { title: 'y', scaleanchor: 'x' },
            showlegend: true,
            margin: { l: 50, r: 50, b: 50, t: 50 }
        };

        const config = { 
            responsive: true,
            displaylogo: false
        };

        Plotly.newPlot('plot-gradient', data, layout, config);
    } catch (error) {
        console.error('Error en visualización del gradiente:', error);
        showError('plot-gradient', 'Error al visualizar el campo gradiente');
    }
}

// =====================================================
// TAB 5: OPTIMIZACIÓN CON RESTRICCIONES
// =====================================================

/**
 * Optimiza una función con restricciones usando multiplicadores de Lagrange
 */
function optimizeWithConstraints() {
    try {
        const fStr = document.getElementById('function-opt').value;
        const gStr = document.getElementById('constraint-opt').value;

        const f = math.parse(fStr);
        const g = math.parse(gStr);

        // Calcular gradientes
        const dfdx = math.derivative(f, 'x');
        const dfdy = math.derivative(f, 'y');
        const dgdx = math.derivative(g, 'x');
        const dgdy = math.derivative(g, 'y');

        // Mostrar sistema de ecuaciones
        document.getElementById('optimization-result').innerHTML = `
            <div class="result-box">
                <h3>🎯 Optimización con Multiplicadores de Lagrange</h3>
                <p><strong>Función Objetivo:</strong> f(x, y) = ${fStr}</p>
                <p><strong>Restricción:</strong> g(x, y) = ${gStr} = 0</p>
                <hr>
                <h4>Método de Multiplicadores de Lagrange:</h4>
                <p>Se busca optimizar f sujeto a g = 0 usando: ∇f = λ∇g</p>
                <hr>
                <h4>Gradientes:</h4>
                <p><strong>∇f =</strong> (${dfdx.toString()}, ${dfdy.toString()})</p>
                <p><strong>∇g =</strong> (${dgdx.toString()}, ${dgdy.toString()})</p>
                <hr>
                <h4>Sistema de Ecuaciones a Resolver:</h4>
                <pre>${dfdx.toString()} = λ · (${dgdx.toString()})
${dfdy.toString()} = λ · (${dgdy.toString()})
${gStr} = 0</pre>
                <hr>
                <p style="font-style: italic; color: #666;">
                    <strong>Nota:</strong> Este sistema se puede resolver analíticamente o numéricamente. 
                    A continuación se muestra una búsqueda numérica de puntos candidatos.
                </p>
            </div>
        `;

        // Búsqueda numérica de puntos críticos
        findCriticalPoints(fStr, gStr);
        
        // Visualizar problema de optimización
        visualizeOptimization(fStr, gStr);
    } catch (error) {
        showError('optimization-result', error.message);
    }
}

/**
 * Encuentra puntos críticos numéricamente
 * @param {string} fStr - Función objetivo
 * @param {string} gStr - Restricción
 */
function findCriticalPoints(fStr, gStr) {
    try {
        const candidates = [];
        const range = 5;
        const steps = 100;

        // Búsqueda por malla fina
        for (let i = 0; i < steps; i++) {
            for (let j = 0; j < steps; j++) {
                const x = -range + (2 * range * i / steps);
                const y = -range + (2 * range * j / steps);
                
                const gVal = evaluateFunction(gStr, x, y);
                
                // Si está cerca de la restricción (g ≈ 0)
                if (Math.abs(gVal) < 0.1) {
                    const fVal = evaluateFunction(fStr, x, y);
                    if (!isNaN(fVal) && isFinite(fVal)) {
                        candidates.push({ x: x, y: y, f: fVal });
                    }
                }
            }
        }

        if (candidates.length > 0) {
            // Ordenar por valor de f
            candidates.sort((a, b) => a.f - b.f);
            
            const min = candidates[0];
            const max = candidates[candidates.length - 1];

            const resultDiv = document.getElementById('optimization-result');
            resultDiv.innerHTML += `
                <div class="result-box" style="margin-top: 20px; background: #e8f5e9; border-left-color: #4caf50;">
                    <h3>📊 Puntos Críticos (Aproximación Numérica)</h3>
                    <p><strong>Mínimo aproximado:</strong></p>
                    <p>• Punto: (${min.x.toFixed(4)}, ${min.y.toFixed(4)})</p>
                    <p>• Valor: f = ${min.f.toFixed(6)}</p>
                    <hr>
                    <p><strong>Máximo aproximado:</strong></p>
                    <p>• Punto: (${max.x.toFixed(4)}, ${max.y.toFixed(4)})</p>
                    <p>• Valor: f = ${max.f.toFixed(6)}</p>
                    <hr>
                    <p style="font-size: 0.9em; color: #666;">
                        Estos resultados son aproximados. Para resultados exactos, resolver el sistema analíticamente.
                    </p>
                </div>
            `;
        } else {
            const resultDiv = document.getElementById('optimization-result');
            resultDiv.innerHTML += `
                <div class="error-box" style="margin-top: 20px;">
                    No se encontraron puntos críticos en el rango [-5, 5]. 
                    Intente con otra función o restricción.
                </div>
            `;
        }
    } catch (error) {
        console.error('Error en búsqueda de puntos críticos:', error);
    }
}

/**
 * Visualiza el problema de optimización
 * @param {string} fStr - Función objetivo
 * @param {string} gStr - Restricción
 */
function visualizeOptimization(fStr, gStr) {
    try {
        const steps = 50;
        const range = 3;
        
        // Crear malla para curvas de nivel de f
        const x = [];
        const y = [];
        const z = [];

        for (let i = 0; i < steps; i++) {
            x.push(-range + (2 * range * i / (steps - 1)));
            y.push(-range + (2 * range * i / (steps - 1)));
        }

        for (let i = 0; i < steps; i++) {
            const row = [];
            for (let j = 0; j < steps; j++) {
                const val = evaluateFunction(fStr, x[j], y[i]);
                row.push(val);
            }
            z.push(row);
        }

        // Puntos de la restricción g(x,y) = 0
        const constraintX = [];
        const constraintY = [];

        for (let i = 0; i < 200; i++) {
            const testX = -range + (2 * range * i / 199);
            for (let j = 0; j < 200; j++) {
                const testY = -range + (2 * range * j / 199);
                const gVal = evaluateFunction(gStr, testX, testY);
                
                if (Math.abs(gVal) < 0.05) {
                    constraintX.push(testX);
                    constraintY.push(testY);
                }
            }
        }

        const data = [
            {
                type: 'contour',
                x: x,
                y: y,
                z: z,
                colorscale: 'Viridis',
                showscale: true,
                contours: {
                    coloring: 'heatmap',
                    showlines: true
                },
                name: 'f(x,y)'
            },
            {
                type: 'scatter',
                mode: 'markers',
                x: constraintX,
                y: constraintY,
                marker: {
                    size: 3,
                    color: 'red'
                },
                name: 'Restricción g(x,y)=0'
            }
        ];

        const layout = {
            title: 'Función Objetivo con Restricción',
            xaxis: { title: 'x' },
            yaxis: { title: 'y', scaleanchor: 'x' },
            margin: { l: 50, r: 50, b: 50, t: 50 }
        };

        const config = { 
            responsive: true,
            displaylogo: false
        };

        Plotly.newPlot('plot-optimization', data, layout, config);
    } catch (error) {
        console.error('Error en visualización de optimización:', error);
    }
}

// =====================================================
// TAB 6: INTEGRALES DOBLES
// =====================================================

/**
 * Calcula una integral doble numéricamente
 */
function calculateDoubleIntegral() {
    try {
        const funcStr = document.getElementById('function-int').value;
        const xMin = parseFloat(document.getElementById('x-min-int').value);
        const xMax = parseFloat(document.getElementById('x-max-int').value);
        const yMin = parseFloat(document.getElementById('y-min-int').value);
        const yMax = parseFloat(document.getElementById('y-max-int').value);

        // Validar límites
        if (isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax)) {
            throw new Error('Los límites de integración deben ser números válidos');
        }

        if (xMin >= xMax || yMin >= yMax) {
            throw new Error('Los límites deben cumplir: min < max');
        }

        // Calcular integral doble
        const result = numericalDoubleIntegral(funcStr, xMin, xMax, yMin, yMax);
        const area = (xMax - xMin) * (yMax - yMin);

        // Mostrar resultados
        document.getElementById('integral-result').innerHTML = `
            <div class="result-box">
                <h3>∫∫ Integral Doble</h3>
                <p><strong>Función:</strong> f(x, y) = ${funcStr}</p>
                <p><strong>Región:</strong> [${xMin}, ${xMax}] × [${yMin}, ${yMax}]</p>
                <p><strong>Área de la región:</strong> ${area.toFixed(4)} unidades²</p>
                <hr>
                <h4>Resultado:</h4>
                <p style="font-size: 1.4em; text-align: center; padding: 15px; background: white; border-radius: 8px; margin: 10px 0;">
                    <strong>∫∫<sub>R</sub> f(x,y) dA ≈ ${result.toFixed(8)}</strong>
                </p>
                <hr>
                <h4>Interpretación:</h4>
                <p style="font-style: italic; color: #666;">
                    • Si f(x,y) ≥ 0, este resultado representa el volumen bajo la superficie f(x,y) sobre la región R.<br>
                    • El cálculo se realizó usando integración numérica (Regla del Punto Medio 2D).<br>
                    • Promedio de la función en la región: ${(result/area).toFixed(6)}
                </p>
            </div>
        `;

        // Visualizar región de integración
        visualizeIntegralRegion(funcStr, xMin, xMax, yMin, yMax);
    } catch (error) {
        showError('integral-result', error.message);
    }
}

/**
 * Integración numérica doble usando regla del punto medio
 * @param {string} funcStr - Función a integrar
 * @param {number} xMin - Límite inferior x
 * @param {number} xMax - Límite superior x
 * @param {number} yMin - Límite inferior y
 * @param {number} yMax - Límite superior y
 * @returns {number} - Valor aproximado de la integral
 */
function numericalDoubleIntegral(funcStr, xMin, xMax, yMin, yMax) {
    const nx = 100;  // Número de subdivisiones en x
    const ny = 100;  // Número de subdivisiones en y
    const dx = (xMax - xMin) / nx;
    const dy = (yMax - yMin) / ny;

    let sum = 0;
    
    // Regla del punto medio
    for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
            const x = xMin + (i + 0.5) * dx;  // Punto medio en x
            const y = yMin + (j + 0.5) * dy;  // Punto medio en y
            const val = evaluateFunction(funcStr, x, y);
            
            if (!isNaN(val) && isFinite(val)) {
                sum += val;
            }
        }
    }

    return sum * dx * dy;
}

/**
 * Visualiza la región de integración y la superficie
 * @param {string} funcStr - Función a visualizar
 * @param {number} xMin - Límite inferior x
 * @param {number} xMax - Límite superior x
 * @param {number} yMin - Límite inferior y
 * @param {number} yMax - Límite superior y
 */
function visualizeIntegralRegion(funcStr, xMin, xMax, yMin, yMax) {
    try {
        const steps = 30;
        const x = [];
        const y = [];
        const z = [];

        // Generar malla
        for (let i = 0; i < steps; i++) {
            x.push(xMin + (xMax - xMin) * i / (steps - 1));
            y.push(yMin + (yMax - yMin) * i / (steps - 1));
        }

        // Calcular valores z
        for (let i = 0; i < steps; i++) {
            const row = [];
            for (let j = 0; j < steps; j++) {
                const val = evaluateFunction(funcStr, x[j], y[i]);
                row.push(val);
            }
            z.push(row);
        }

        const data = [{
            type: 'surface',
            x: x,
            y: y,
            z: z,
            colorscale: 'Viridis',
            showscale: true,
            opacity: 0.8,
            name: 'f(x,y)'
        }];

        const layout = {
            title: 'Región de Integración y Superficie',
            scene: {
                xaxis: { title: 'x', range: [xMin, xMax] },
                yaxis: { title: 'y', range: [yMin, yMax] },
                zaxis: { title: 'z' },
                camera: {
                    eye: { x: 1.5, y: 1.5, z: 1.2 }
                }
            },
            margin: { l: 0, r: 0, b: 0, t: 40 }
        };

        const config = { 
            responsive: true,
            displaylogo: false
        };

        Plotly.newPlot('plot-integral', data, layout, config);
    } catch (error) {
        console.error('Error en visualización de integral:', error);
    }
}

// =====================================================
// TAB 7: APLICACIONES FÍSICAS
// =====================================================

/**
 * Calcula masa y centro de masa de una lámina
 */
function calculateMassAndCenter() {
    try {
        const densityStr = document.getElementById('density-app').value;
        const xMin = parseFloat(document.getElementById('x-min-app').value);
        const xMax = parseFloat(document.getElementById('x-max-app').value);
        const yMin = parseFloat(document.getElementById('y-min-app').value);
        const yMax = parseFloat(document.getElementById('y-max-app').value);

        // Validar límites
        if (isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax)) {
            throw new Error('Los límites de la región deben ser números válidos');
        }

        // Calcular masa total: m = ∫∫ ρ(x,y) dA
        const mass = numericalDoubleIntegral(densityStr, xMin, xMax, yMin, yMax);

        // Calcular momentos
        // Mx = ∫∫ y·ρ(x,y) dA
        const Mx = numericalDoubleIntegral(`(${densityStr}) * y`, xMin, xMax, yMin, yMax);
        
        // My = ∫∫ x·ρ(x,y) dA
        const My = numericalDoubleIntegral(`(${densityStr}) * x`, xMin, xMax, yMin, yMax);

        // Centro de masa
        const xBar = My / mass;
        const yBar = Mx / mass;

        // Calcular momentos de inercia (opcional)
        const Ix = numericalDoubleIntegral(`(${densityStr}) * y^2`, xMin, xMax, yMin, yMax);
        const Iy = numericalDoubleIntegral(`(${densityStr}) * x^2`, xMin, xMax, yMin, yMax);
        const I0 = Ix + Iy;  // Momento polar de inercia

        // Mostrar resultados
        document.getElementById('application-result').innerHTML = `
            <div class="result-box">
                <h3>⚖️ Propiedades Físicas de la Lámina</h3>
                <p><strong>Densidad:</strong> ρ(x, y) = ${densityStr}</p>
                <p><strong>Región:</strong> [${xMin}, ${xMax}] × [${yMin}, ${yMax}]</p>
                <hr>
                <h4>Masa:</h4>
                <p style="font-size: 1.2em;"><strong>m = ∫∫ ρ(x,y) dA = ${mass.toFixed(6)}</strong> unidades de masa</p>
                <hr>
                <h4>Momentos:</h4>
                <p><strong>Momento respecto al eje x (Mₓ):</strong> ${Mx.toFixed(6)}</p>
                <p><strong>Momento respecto al eje y (Mᵧ):</strong> ${My.toFixed(6)}</p>
                <hr>
                <h4>Centro de Masa:</h4>
                <p style="font-size: 1.3em; text-align: center; padding: 15px; background: white; border-radius: 8px; margin: 10px 0;">
                    <strong>(x̄, ȳ) = (${xBar.toFixed(4)}, ${yBar.toFixed(4)})</strong>
                </p>
                <hr>
                <h4>Momentos de Inercia:</h4>
                <p><strong>Iₓ =</strong> ${Ix.toFixed(6)} (respecto al eje x)</p>
                <p><strong>Iᵧ =</strong> ${Iy.toFixed(6)} (respecto al eje y)</p>
                <p><strong>I₀ =</strong> ${I0.toFixed(6)} (momento polar)</p>
                <hr>
                <p style="font-style: italic; color: #666;">
                    <strong>Interpretación:</strong> El centro de masa es el punto donde se puede considerar 
                    concentrada toda la masa de la lámina. Es el punto de equilibrio de la distribución de masa.
                </p>
            </div>
        `;

        // Visualizar distribución de densidad y centro de masa
        visualizeCenterOfMass(densityStr, xMin, xMax, yMin, yMax, xBar, yBar);
    } catch (error) {
        showError('application-result', error.message);
    }
}

/**
 * Visualiza la distribución de densidad y el centro de masa
 * @param {string} densityStr - Función de densidad
 * @param {number} xMin - Límite inferior x
 * @param {number} xMax - Límite superior x
 * @param {number} yMin - Límite inferior y
 * @param {number} yMax - Límite superior y
 * @param {number} xBar - Coordenada x del centro de masa
 * @param {number} yBar - Coordenada y del centro de masa
 */
function visualizeCenterOfMass(densityStr, xMin, xMax, yMin, yMax, xBar, yBar) {
    try {
        const steps = 30;
        const x = [];
        const y = [];
        const z = [];

        // Generar malla
        for (let i = 0; i < steps; i++) {
            x.push(xMin + (xMax - xMin) * i / (steps - 1));
            y.push(yMin + (yMax - yMin) * i / (steps - 1));
        }

        // Calcular densidad en cada punto
        for (let i = 0; i < steps; i++) {
            const row = [];
            for (let j = 0; j < steps; j++) {
                const val = evaluateFunction(densityStr, x[j], y[i]);
                row.push(val);
            }
            z.push(row);
        }

        // Calcular altura del centro de masa en la superficie
        const zBar = evaluateFunction(densityStr, xBar, yBar);

        const data = [
            {
                type: 'surface',
                x: x,
                y: y,
                z: z,
                colorscale: 'Viridis',
                showscale: true,
                opacity: 0.7,
                name: 'Densidad ρ(x,y)'
            },
            {
                type: 'scatter3d',
                mode: 'markers',
                x: [xBar],
                y: [yBar],
                z: [zBar],
                marker: {
                    size: 10,
                    color: 'red',
                    symbol: 'diamond',
                    line: { width: 2, color: 'white' }
                },
                name: 'Centro de masa'
            },
            {
                type: 'scatter3d',
                mode: 'lines',
                x: [xBar, xBar],
                y: [yBar, yBar],
                z: [0, zBar],
                line: {
                    color: 'red',
                    width: 4,
                    dash: 'dash'
                },
                showlegend: false,
                hoverinfo: 'skip'
            }
        ];

        const layout = {
            title: 'Distribución de Densidad y Centro de Masa',
            scene: {
                xaxis: { title: 'x' },
                yaxis: { title: 'y' },
                zaxis: { title: 'ρ(x,y)' },
                camera: {
                    eye: { x: 1.5, y: 1.5, z: 1.2 }
                }
            },
            margin: { l: 0, r: 0, b: 0, t: 40 }
        };

        const config = { 
            responsive: true,
            displaylogo: false
        };

        Plotly.newPlot('plot-application', data, layout, config);
    } catch (error) {
        console.error('Error en visualización de aplicaciones:', error);
    }
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

/**
 * Inicializa la aplicación cuando se carga la página
 */
window.addEventListener('DOMContentLoaded', function() {
    console.log('🧮 Calculadora de Cálculo Multivariado inicializada');
    console.log('📊 Versión 1.0.0');
    
    // Visualizar función por defecto
    visualize3D();
});

// Mensaje de bienvenida en consola
console.log('%c🧮 Calculadora de Cálculo Multivariado', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cProyecto Final - Ingeniería de Software', 'color: #764ba2; font-size: 14px;');
console.log('%c📚 Funcionalidades: Visualización 3D, Derivadas, Gradientes, Optimización, Integrales', 'color: #666; font-size: 12px;');
