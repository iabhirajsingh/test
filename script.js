// ── State ────────────────────────────────────────────────────────
let expression     = '';   // expression string built up before "="
let currentInput   = '0';  // number currently shown large on display
let justEvaluated  = false; // true right after pressing "="
let openParens     = 0;    // track unclosed "("

// ── DOM refs ─────────────────────────────────────────────────────
const exprEl      = document.getElementById('expr');
const currentEl   = document.getElementById('current');
const historyList = document.getElementById('historyList');

// ── Display ──────────────────────────────────────────────────────
function updateDisplay() {
  exprEl.textContent = expression;
  currentEl.textContent = currentInput;

  // Shrink font when number is long so it fits
  const len = currentInput.length;
  currentEl.style.fontSize = len > 14 ? '18px'
                           : len > 10 ? '26px'
                           : len >  7 ? '32px'
                           : '38px';
}

// ── Number input ─────────────────────────────────────────────────
function appendDigit(digit) {
  if (justEvaluated) {
    // Start a fresh calculation after seeing a result
    expression   = '';
    currentInput = digit;
    justEvaluated = false;
  } else {
    currentInput = currentInput === '0' ? digit : currentInput + digit;
  }
  updateDisplay();
}

function appendDecimal() {
  if (justEvaluated) {
    currentInput  = '0.';
    expression    = '';
    justEvaluated = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

// ── Operators ────────────────────────────────────────────────────
function appendOperator(op) {
  justEvaluated = false;

  // If expression already ends with an operator and user taps another,
  // replace the old one rather than chaining two operators.
  if (expression.match(/[+\-*/%]\s*$/) && currentInput === '0') {
    expression = expression.replace(/[+\-*/%]\s*$/, op + ' ');
  } else {
    expression   += currentInput + ' ' + op + ' ';
    currentInput  = '0';
  }
  updateDisplay();
}

// ── Scientific functions ─────────────────────────────────────────
// Trig functions use DEGREES (more intuitive for most people).
function applyFunc(func) {
  const val = parseFloat(currentInput);
  if (isNaN(val)) return;

  const rad = val * (Math.PI / 180); // degrees → radians
  let result;

  switch (func) {
    case 'sin':    result = Math.sin(rad);    break;
    case 'cos':    result = Math.cos(rad);    break;
    case 'tan':    result = Math.tan(rad);    break;
    case 'sqrt':   result = Math.sqrt(val);   break;
    case 'square': result = val * val;         break;
    case 'log':    result = Math.log10(val);  break;
    case 'ln':     result = Math.log(val);    break;
    default: return;
  }

  // Round away tiny floating-point noise (e.g. sin(180) ≈ 1.22e-16 → 0)
  result = parseFloat(result.toFixed(10));

  const label = { sin: 'sin', cos: 'cos', tan: 'tan', sqrt: '√', square: 'sqr', log: 'log', ln: 'ln' };
  expression  += label[func] + '(' + currentInput + ') ';
  currentInput = String(result);
  updateDisplay();
}

function insertConstant(name) {
  if (justEvaluated) { expression = ''; justEvaluated = false; }
  currentInput = name === 'pi' ? String(Math.PI) : String(Math.E);
  updateDisplay();
}

function insertParen(paren) {
  justEvaluated = false;
  if (paren === '(') {
    // Implicit multiplication if there's a pending number, e.g. "5 × ("
    if (currentInput !== '0') {
      expression  += currentInput + ' * ';
      currentInput = '0';
    }
    expression += '(';
    openParens++;
  } else {
    // Close only if there's something to close
    if (openParens > 0) {
      expression  += currentInput + ')';
      currentInput = '0';
      openParens--;
    }
  }
  updateDisplay();
}

// ── Clear / edit ─────────────────────────────────────────────────
function clearAll() {
  expression    = '';
  currentInput  = '0';
  justEvaluated = false;
  openParens    = 0;
  updateDisplay();
}

function backspace() {
  if (justEvaluated) { clearAll(); return; }
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
  updateDisplay();
}

function toggleSign() {
  if (currentInput === '0' || currentInput === 'Error') return;
  currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;
  updateDisplay();
}

// ── Calculate ─────────────────────────────────────────────────────
function calculate() {
  if (expression === '' && currentInput === '0') return;

  const fullExpr = expression + currentInput;

  // Close any open parentheses automatically
  let jsExpr = fullExpr + ')'.repeat(openParens);
  openParens = 0;

  // All input comes from our controlled buttons, so this is safe to evaluate.
  // We use the Function constructor (slightly safer than eval in strict mode).
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function('return ' + jsExpr)();

    if (!isFinite(result) || isNaN(result)) {
      showError(fullExpr);
      return;
    }

    const formatted = parseFloat(result.toFixed(10));
    addToHistory(fullExpr, formatted);
    expression    = fullExpr + ' =';
    currentInput  = String(formatted);
    justEvaluated = true;
  } catch {
    showError(fullExpr);
  }

  updateDisplay();
}

function showError(fullExpr) {
  expression   = fullExpr;
  currentInput = 'Error';
  justEvaluated = true;
}

// ── History ───────────────────────────────────────────────────────
function addToHistory(expr, result) {
  const li = document.createElement('li');
  li.innerHTML = `
    <div class="h-expr">${expr} =</div>
    <div class="h-result">${result}</div>
  `;
  // Clicking a history item loads that result back into the display
  li.addEventListener('click', () => {
    currentInput  = String(result);
    expression    = '';
    justEvaluated = false;
    updateDisplay();
  });
  historyList.prepend(li);
}

function clearHistory() {
  historyList.innerHTML = '';
}

// ── Keyboard support ──────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') { appendDigit(e.key); return; }
  switch (e.key) {
    case '.': case ',':  appendDecimal();        break;
    case '+':            appendOperator('+');     break;
    case '-':            appendOperator('-');     break;
    case '*':            appendOperator('*');     break;
    case '/':            e.preventDefault();
                         appendOperator('/');     break;
    case '%':            appendOperator('%');     break;
    case 'Enter':
    case '=':            calculate();             break;
    case 'Backspace':    backspace();             break;
    case 'Escape':       clearAll();              break;
    case '(':            insertParen('(');        break;
    case ')':            insertParen(')');        break;
  }
});
