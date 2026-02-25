// ── State ────────────────────────────────────────────────────────
// Two expression strings are maintained in parallel:
//   displayExpr  → shown to the user (pretty symbols, function notation)
//   evalExpr     → fed to new Function() for evaluation (valid JS only)
// This separation is the key fix: scientific functions like sin() must never
// appear in evalExpr because `sin` is not defined in JS scope.
let displayExpr  = '';
let evalExpr     = '';
let currentInput = '0';  // the number shown large on the display
let justEvaluated = false; // true right after pressing "="
let openParens   = 0;      // count of unclosed "("

// ── DOM refs ─────────────────────────────────────────────────────
const exprEl      = document.getElementById('expr');
const currentEl   = document.getElementById('current');
const historyList = document.getElementById('historyList');

// ── Display ──────────────────────────────────────────────────────
function updateDisplay() {
  exprEl.textContent = displayExpr;
  currentEl.textContent = currentInput;

  // Shrink font when the number is long so it fits in the display box
  const len = currentInput.length;
  currentEl.style.fontSize = len > 14 ? '18px'
                           : len > 10 ? '26px'
                           : len >  7 ? '32px'
                           : '38px';
}

// ── Number input ─────────────────────────────────────────────────
function appendDigit(digit) {
  if (justEvaluated) {
    // Start a fresh calculation; discard the previous result's expression
    displayExpr   = '';
    evalExpr      = '';
    currentInput  = digit;
    justEvaluated = false;
  } else {
    currentInput = currentInput === '0' ? digit : currentInput + digit;
  }
  updateDisplay();
}

function appendDecimal() {
  if (justEvaluated) {
    displayExpr   = '';
    evalExpr      = '';
    currentInput  = '0.';
    justEvaluated = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

// ── Operators ────────────────────────────────────────────────────
// Buttons call appendOperator with ASCII operators: +  -  *  /  %
// We map them to pretty display symbols here.
const DISPLAY_OP = { '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%' };

function appendOperator(op) {
  const disp = DISPLAY_OP[op] || op;

  if (justEvaluated) {
    // FIX for bug 1: after "=", start a fresh expression from the result
    // instead of appending to the old one that contains "=".
    displayExpr   = currentInput + ' ' + disp + ' ';
    evalExpr      = currentInput + ' ' + op   + ' ';
    currentInput  = '0';
    justEvaluated = false;
  } else if (evalExpr.match(/[+\-*/%]\s*$/) && currentInput === '0') {
    // Replace a trailing operator rather than chaining two operators
    displayExpr = displayExpr.replace(/[+−×÷%]\s*$/, disp + ' ');
    evalExpr    = evalExpr.replace(/[+\-*/%]\s*$/, op + ' ');
  } else {
    displayExpr  += currentInput + ' ' + disp + ' ';
    evalExpr     += currentInput + ' ' + op   + ' ';
    currentInput  = '0';
  }
  updateDisplay();
}

// ── Scientific functions ─────────────────────────────────────────
// Trig functions use DEGREES (more intuitive for most users).
// FIX for bugs 2 & 3: functions are computed immediately and stored as a
// plain number in currentInput. Only displayExpr gets the "sin(...)" label;
// evalExpr never sees function names so it stays valid JS.
function applyFunc(func) {
  if (currentInput === 'Error') return;
  const val = parseFloat(currentInput);
  if (isNaN(val)) return;

  // FIX for bug 3: if we just evaluated, start fresh before appending
  if (justEvaluated) {
    displayExpr   = '';
    evalExpr      = '';
    justEvaluated = false;
  }

  const rad = val * (Math.PI / 180); // degrees → radians
  let result;
  switch (func) {
    case 'sin':    result = Math.sin(rad);   break;
    case 'cos':    result = Math.cos(rad);   break;
    case 'tan':    result = Math.tan(rad);   break;
    case 'sqrt':   result = Math.sqrt(val);  break;
    case 'square': result = val * val;        break;
    case 'log':    result = Math.log10(val); break;
    case 'ln':     result = Math.log(val);   break;
    default: return;
  }

  if (!isFinite(result) || isNaN(result)) {
    currentInput = 'Error';
    updateDisplay();
    return;
  }

  // Round off tiny floating-point noise (e.g. sin(180) ≈ 1.22e-16 → 0)
  result = parseFloat(result.toFixed(10));

  const LABELS = { sin: 'sin', cos: 'cos', tan: 'tan', sqrt: '√', square: 'sqr', log: 'log', ln: 'ln' };
  // displayExpr gets the friendly function notation for the user to read
  displayExpr += LABELS[func] + '(' + currentInput + ') ';
  // evalExpr does NOT get the function string — the result is already computed.
  // When the user next presses an operator, appendOperator will append the
  // numeric currentInput to evalExpr, which is perfectly valid JS.
  currentInput = String(result);
  updateDisplay();
}

function insertConstant(name) {
  if (justEvaluated) {
    displayExpr   = '';
    evalExpr      = '';
    justEvaluated = false;
  }
  currentInput = name === 'pi' ? String(Math.PI) : String(Math.E);
  updateDisplay();
}

function insertParen(paren) {
  justEvaluated = false;
  if (paren === '(') {
    if (currentInput !== '0') {
      // Implicit multiplication: 5( → 5 × (
      displayExpr  += currentInput + ' × (';
      evalExpr     += currentInput + ' * (';
      currentInput  = '0';
    } else {
      displayExpr += '(';
      evalExpr    += '(';
    }
    openParens++;
  } else if (openParens > 0) {
    displayExpr  += currentInput + ')';
    evalExpr     += currentInput + ')';
    currentInput  = '0';
    openParens--;
  }
  updateDisplay();
}

// ── Clear / edit ─────────────────────────────────────────────────
function clearAll() {
  displayExpr   = '';
  evalExpr      = '';
  currentInput  = '0';
  justEvaluated = false;
  openParens    = 0;
  updateDisplay();
}

function backspace() {
  if (currentInput === 'Error') { clearAll(); return; }

  // FIX for bug 5: instead of wiping everything, clear the expressions but
  // keep currentInput so the user can edit the result digit by digit.
  if (justEvaluated) {
    displayExpr   = '';
    evalExpr      = '';
    justEvaluated = false;
  }

  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
  updateDisplay();
}

function toggleSign() {
  if (currentInput === '0' || currentInput === 'Error') return;
  currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;

  // FIX for bug 4: reset state so continued calculations use a clean expression
  if (justEvaluated) {
    displayExpr   = '';
    evalExpr      = '';
    justEvaluated = false;
  }
  updateDisplay();
}

// ── Calculate ─────────────────────────────────────────────────────
function calculate() {
  if (evalExpr === '' && currentInput === '0') return;
  if (currentInput === 'Error') return;

  const fullDisplay = displayExpr + currentInput;
  // Close any unclosed parentheses before evaluating
  const fullEval = evalExpr + currentInput + ')'.repeat(openParens);
  openParens = 0;

  try {
    // All input comes from our controlled buttons, so this is safe.
    // eslint-disable-next-line no-new-func
    const result = new Function('return ' + fullEval)();

    if (!isFinite(result) || isNaN(result)) {
      showError(fullDisplay);
      return;
    }

    const formatted = parseFloat(result.toFixed(10));
    addToHistory(fullDisplay, formatted);
    displayExpr   = fullDisplay + ' =';
    evalExpr      = '';
    currentInput  = String(formatted);
    justEvaluated = true;
  } catch {
    showError(fullDisplay);
  }

  updateDisplay();
}

function showError(fullDisplay) {
  displayExpr   = fullDisplay;
  evalExpr      = '';
  currentInput  = 'Error';
  justEvaluated = true;
}

// ── History ───────────────────────────────────────────────────────
function addToHistory(expr, result) {
  const li = document.createElement('li');

  // FIX for bug 6: use textContent instead of innerHTML to avoid XSS
  const exprDiv = document.createElement('div');
  exprDiv.className   = 'h-expr';
  exprDiv.textContent = expr + ' =';

  const resultDiv = document.createElement('div');
  resultDiv.className   = 'h-result';
  resultDiv.textContent = String(result);

  li.appendChild(exprDiv);
  li.appendChild(resultDiv);

  // Clicking a history entry loads that result back into the calculator
  li.addEventListener('click', () => {
    currentInput  = String(result);
    displayExpr   = '';
    evalExpr      = '';
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
    case '.': case ',':  appendDecimal();     break;
    case '+':            appendOperator('+'); break;
    case '-':            appendOperator('-'); break;
    case '*':            appendOperator('*'); break;
    case '/':            e.preventDefault();
                         appendOperator('/'); break;
    case '%':            appendOperator('%'); break;
    case 'Enter':
    case '=':            calculate();         break;
    case 'Backspace':    backspace();         break;
    case 'Escape':       clearAll();          break;
    case '(':            insertParen('(');    break;
    case ')':            insertParen(')');    break;
  }
});
