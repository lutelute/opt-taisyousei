// Setup Charts - Two separate charts for different scales
let symChartCtx = document.getElementById('chart_symmetric').getContext('2d');
let asymChartCtx = document.getElementById('chart_asymmetric').getContext('2d');
let symChart, asymChart;

function initCharts() {
    if (symChart) symChart.destroy();
    if (asymChart) asymChart.destroy();

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                title: { display: true, text: 'Iterations', color: '#94a3b8' },
                grid: { color: '#334155' },
                ticks: { color: '#94a3b8' }
            }
        }
    };

    // Symmetric chart (wider range for slower convergence)
    symChart = new Chart(symChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Residual Error',
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                data: [],
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 1,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    type: 'logarithmic',
                    min: 1e-6,
                    max: 10,
                    title: { display: true, text: 'Error', color: '#94a3b8' },
                    grid: { color: '#334155' },
                    ticks: {
                        color: '#94a3b8',
                        callback: (v) => {
                            const exp = Math.log10(v);
                            return Number.isInteger(exp) ? '10^' + exp : '';
                        }
                    }
                }
            }
        }
    });

    // Asymmetric chart (deeper range for faster convergence)
    asymChart = new Chart(asymChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Residual Error',
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                data: [],
                tension: 0,
                borderWidth: 2,
                pointRadius: 1,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    type: 'logarithmic',
                    min: 1e-12,
                    max: 10,
                    title: { display: true, text: 'Error', color: '#94a3b8' },
                    grid: { color: '#334155' },
                    ticks: {
                        color: '#94a3b8',
                        callback: (v) => {
                            const exp = Math.log10(v);
                            return Number.isInteger(exp) ? '10^' + exp : '';
                        }
                    }
                }
            }
        }
    });
}

// Geometric Utilities
function randomPoint(width, height) {
    return { x: Math.random() * width, y: Math.random() * height };
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function interpolate(p1, p2, t) {
    return {
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t
    };
}

// Global State
const canvasSym = document.getElementById('canvas_symmetric');
const ctxSym = canvasSym.getContext('2d');
const canvasAsym = document.getElementById('canvas_asymmetric');
const ctxAsym = canvasAsym.getContext('2d');
const consoleSym = document.getElementById('console_symmetric');
const consoleAsym = document.getElementById('console_asymmetric');

// Matrix Visualization State
const canvasMatrixSym = document.getElementById('matrix_sym');
const ctxMatrixSym = canvasMatrixSym.getContext('2d');
const canvasMatrixAsym = document.getElementById('matrix_asym');
const ctxMatrixAsym = canvasMatrixAsym.getContext('2d');

const scaleSelector = document.getElementById('problem_scale');
const scaleDesc = document.getElementById('scale_desc');

// Set canvas size
function resizeCanvas() {
    const size = canvasSym.clientWidth;
    canvasSym.width = size;
    canvasSym.height = size;
    canvasAsym.width = size;
    canvasAsym.height = size;

    // Matrix canvases (strip)
    canvasMatrixSym.width = canvasMatrixSym.clientWidth;
    canvasMatrixSym.height = canvasMatrixSym.clientHeight;
    canvasMatrixAsym.width = canvasMatrixAsym.clientWidth;
    canvasMatrixAsym.height = canvasMatrixAsym.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Constants for Colors
const COLORS = {
    bg: '#0f172a',
    grid: '#1e293b',
    text: '#94a3b8',
    primary: '#3b82f6', // Blue (Symmetric)
    secondary: '#10b981', // Green (Asymmetric)
    optimal: '#f59e0b', // Amber (Optimal Point) - Changed from Red
    optimalText: '#fff',
    matrix: {
        bg: '#0f172a',
        diagonal: '#3b82f6',
        sparsity: '#475569',
        asymElem: '#10b981'
    }
};

// Matrix Drawing Logic - Enhanced for clarity
function drawMatrix(ctx, width, height, isAsymmetric) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = COLORS.matrix.bg;
    ctx.fillRect(0, 0, width, height);

    const cellSize = 3;
    const aspectRatio = height / width;

    // Draw Diagonal (Main Structure) - Strong blue line
    ctx.fillStyle = COLORS.matrix.diagonal;
    for (let i = 0; i < width; i += cellSize) {
        const y = i * aspectRatio;
        ctx.fillRect(i, y, cellSize, cellSize);
    }

    // Draw Random Sparsity (Symmetric/Non-symmetric parts)
    const numEntries = 300;
    ctx.fillStyle = COLORS.matrix.sparsity;

    for (let k = 0; k < numEntries; k++) {
        // Generate point in upper triangle
        const x = Math.random() * width;
        const y = Math.random() * (x * aspectRatio); // Upper triangle

        ctx.fillRect(x, y, 2, 2);

        // For symmetric matrix, mirror across diagonal
        if (!isAsymmetric) {
            const mirrorX = y / aspectRatio;
            const mirrorY = x * aspectRatio;
            ctx.fillRect(mirrorX, mirrorY, 2, 2);
        }
    }

    // Draw Asymmetric Perturbation (Only for asymmetric)
    // These appear ONLY in the lower triangle, breaking symmetry
    if (isAsymmetric) {
        ctx.fillStyle = COLORS.matrix.asymElem;
        for (let k = 0; k < 150; k++) {
            // Place in lower triangle only (below diagonal)
            const x = Math.random() * width * 0.8;
            const minY = x * aspectRatio + 5; // Below diagonal
            const y = minY + Math.random() * (height - minY);

            if (y < height) {
                ctx.fillRect(x, y, 3, 3);
            }
        }
    }

    // Draw axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText('i', width - 10, 12);
    ctx.fillText('j', 3, height - 5);
}

// Simulation State
let isRunning = false;
let animationId;
let currentProblem = null;
let symPath = [];
let asymPath = [];
let iteration = 0;

// Log function
function log(element, message) {
    element.innerHTML += `> ${message}<br>`;
    element.scrollTop = element.scrollHeight;
}

// Problem Generator
function generateProblem() {
    const w = canvasSym.width;
    const h = canvasSym.height;

    const optimal = { x: w * 0.8, y: h * 0.2 };
    const start = { x: w * 0.2, y: h * 0.8 };

    const constraints = [];
    for (let i = 0; i < 5; i++) {
        constraints.push({
            p1: randomPoint(w, h),
            p2: randomPoint(w, h)
        });
    }

    return { start, optimal, constraints, w, h };
}

function drawProblem(ctx, problem, path, color) {
    ctx.clearRect(0, 0, problem.w, problem.h);

    // Draw grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i < problem.w; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, problem.h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(problem.w, i); ctx.stroke();
    }

    // Draw Optimal Point
    ctx.fillStyle = COLORS.optimal;
    ctx.beginPath();
    ctx.arc(problem.optimal.x, problem.optimal.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.optimalText;
    ctx.font = '12px monospace';
    ctx.fillText("OPTIMAL", problem.optimal.x + 10, problem.optimal.y);

    // Draw Start Point
    ctx.fillStyle = COLORS.primary;
    ctx.beginPath();
    ctx.arc(problem.start.x, problem.start.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Path
    if (path.length > 0) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();

        // Draw head
        const last = path[path.length - 1];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Main Loop
function runSimulation() {
    if (isRunning) return;
    isRunning = true;

    initCharts();
    resizeCanvas();
    currentProblem = generateProblem();

    // Draw Matrix Visualizations
    drawMatrix(ctxMatrixSym, canvasMatrixSym.width, canvasMatrixSym.height, false);
    drawMatrix(ctxMatrixAsym, canvasMatrixAsym.width, canvasMatrixAsym.height, true);

    // Determine Logic based on Scale
    const scale = scaleSelector.value;
    const isLarge = scale === 'large';

    // Reset UI
    document.getElementById('sym_status').textContent = "RUNNING";
    document.getElementById('sym_status').className = "status_running";
    document.getElementById('asym_status').textContent = "RUNNING";
    document.getElementById('asym_status').className = "status_running";

    log(consoleSym, isLarge ? "Problem Scale: Large (N=10,000)" : "Problem Scale: Small (N=100)");
    log(consoleSym, "Starting interior point method...");
    log(consoleAsym, "Initializing asymmetric solver...");

    symPath = [currentProblem.start];
    asymPath = [currentProblem.start];
    iteration = 0;

    // Metrics
    let symError = 1.0;
    let asymError = 1.0;
    let symDone = false;
    let asymDone = false;

    // Simulation parameters
    const totalSymSteps = isLarge ? 400 : 50; // Large = Many steps (or fail), Small = Few steps
    const totalAsymSteps = isLarge ? 40 : 20; // Proposed always fast
    const failRateSym = isLarge ? 0.8 : 0.0; // 80% chance to stall on large

    function loop() {
        if (!isRunning) return;

        iteration++;

        // Update Standard Solver
        if (!symDone) {
            // Logic: If Large, it might effectively "stall" (wobble a lot and not reach)
            // If Small, it goes straight-ish

            if (iteration < totalSymSteps) {
                const progress = iteration / totalSymSteps;
                let t = progress;

                // Add wobble
                let wobbleFactor = isLarge ? 50 : 10;
                if (isLarge && iteration > 100) wobbleFactor = 80; // Getting worse

                const easeT = easeInOutQuad(t);
                const straight = interpolate(currentProblem.start, currentProblem.optimal, easeT);

                // If isLarge and we are stalling, just oscillate around
                const noise = Math.sin(iteration * 0.1) * wobbleFactor * (1 - easeT);

                symPath.push({
                    x: straight.x + Math.sin(iteration / 5) * wobbleFactor * (1 - t),
                    y: straight.y + Math.cos(iteration / 5) * wobbleFactor * (1 - t)
                });

                symError = Math.max(1e-4, 1 - easeT + (Math.random() * 0.1));

                document.getElementById('sym_iter').textContent = `Iter: ${iteration}`;
                if (iteration % 20 === 0) log(consoleSym, `Update... cond(H) = ${(isLarge ? 1e12 : 1e4).toExponential(1)}`);
            } else {
                // Done?
                symDone = true;
                symPath.push(currentProblem.optimal);
                symError = 1e-5;
                document.getElementById('sym_status').textContent = "CONVERGED";
                document.getElementById('sym_status').className = "status_done";
                document.getElementById('res_sym_iter').textContent = iteration;
                document.getElementById('res_sym_gap').textContent = "1e-5";
                log(consoleSym, "Converged.");
            }
        }

        // Update Asymmetric Solver (Always Fast)
        if (!asymDone) {
            const currentAsymStep = iteration;
            if (currentAsymStep <= totalAsymSteps) {
                const t = currentAsymStep / totalAsymSteps;
                asymPath.push(interpolate(currentProblem.start, currentProblem.optimal, t));
                asymError = Math.max(1e-10, Math.pow(0.1, currentAsymStep / 1.5));

                document.getElementById('asym_iter').textContent = `Iter: ${currentAsymStep}`;
                log(consoleAsym, `Step ${currentAsymStep}: Residual ${asymError.toExponential(2)}`);
            } else {
                asymDone = true;
                asymPath.push(currentProblem.optimal);
                asymError = 1e-10;
                document.getElementById('asym_status').textContent = "CONVERGED";
                document.getElementById('asym_status').className = "status_done";
                document.getElementById('res_asym_iter').textContent = totalAsymSteps;
                document.getElementById('res_asym_gap').textContent = "1e-10";
                log(consoleAsym, "Converged. Machine precision.");
            }
        }

        // Update Charts (separate)
        if (iteration % 5 === 0) {
            // Update Symmetric chart
            if (!symDone) {
                symChart.data.labels.push(iteration);
                symChart.data.datasets[0].data.push(symError);
                symChart.update('none');
            }
            // Update Asymmetric chart
            if (!asymDone) {
                asymChart.data.labels.push(iteration);
                asymChart.data.datasets[0].data.push(asymError);
                asymChart.update('none');
            }
        }

        drawProblem(ctxSym, currentProblem, symPath, '#3b82f6');
        drawProblem(ctxAsym, currentProblem, asymPath, '#10b981');

        if (!symDone || !asymDone) {
            animationId = requestAnimationFrame(loop);
        } else {
            isRunning = false;
        }
    }

    loop();
}

function resetSimulation() {
    isRunning = false;
    cancelAnimationFrame(animationId);

    symPath = [];
    asymPath = [];

    initCharts();

    const w = canvasSym.width;
    ctxSym.clearRect(0, 0, w, w);
    ctxAsym.clearRect(0, 0, w, w);
    ctxMatrixSym.clearRect(0, 0, canvasMatrixSym.width, canvasMatrixSym.height); // Clear matrices too
    ctxMatrixAsym.clearRect(0, 0, canvasMatrixAsym.width, canvasMatrixAsym.height);

    document.getElementById('sym_status').textContent = "WAITING";
    document.getElementById('asym_status').textContent = "WAITING";
    document.getElementById('sym_status').className = "status_waiting";
    document.getElementById('asym_status').className = "status_waiting";
    document.getElementById('res_sym_iter').textContent = "-";
    document.getElementById('res_asym_iter').textContent = "-";
    document.getElementById('res_sym_gap').textContent = "-";
    document.getElementById('res_asym_gap').textContent = "-";
    document.getElementById('sym_iter').textContent = "Iter: 0";
    document.getElementById('asym_iter').textContent = "Iter: 0";

    consoleSym.innerHTML = "> Reset.<br>";
    consoleAsym.innerHTML = "> Reset.<br>";
}

// Scale Selector Event
scaleSelector.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'small') {
        scaleDesc.textContent = "Simulating a local logistics problem (N=100). Both methods work, but Asymmetric is still faster.";
    } else {
        scaleDesc.textContent = "Simulating a massive logistics network (N=10,000). Matrix condition number explodes, causing the Symmetric solver to struggle.";
    }
    resetSimulation();
});

document.getElementById('btn_run').addEventListener('click', runSimulation);
document.getElementById('btn_reset').addEventListener('click', resetSimulation);

initCharts();
