/**
 * Health Track: BMI and Calorie Companion
 * Pure Vanilla JavaScript implementation
 */

// Mock meals data (hardcoded array)
const MOCK_MEALS_DATA = [
  {
    tier: 'low',
    maxCalories: 1700,
    planTitle: 'Deficit Plan (~1,500 kcal)',
    meals: [
      {
        mealType: 'Breakfast',
        title: 'Egg White Veggie Scramble & Berries',
        desc: 'Scramble of 3 egg whites and 1 whole egg with spinach, cherry tomatoes, and 1 slice whole-wheat toast.',
        calories: 320,
        macros: 'Protein: 26g | Carbs: 28g | Fat: 9g'
      },
      {
        mealType: 'Lunch',
        title: 'Grilled Lemon Herb Chicken & Quinoa',
        desc: '150g tender grilled chicken breast served over warm quinoa, steamed green beans, and lemon olive oil dressing.',
        calories: 480,
        macros: 'Protein: 42g | Carbs: 45g | Fat: 12g'
      },
      {
        mealType: 'Dinner',
        title: 'Baked Atlantic Salmon with Asparagus',
        desc: '140g baked salmon fillet seasoned with herbs, accompanied by roasted asparagus and half baked sweet potato.',
        calories: 520,
        macros: 'Protein: 38g | Carbs: 30g | Fat: 18g'
      }
    ]
  },
  {
    tier: 'moderate',
    maxCalories: 2300,
    planTitle: 'Maintenance Plan (~2,000 kcal)',
    meals: [
      {
        mealType: 'Breakfast',
        title: 'Almond Chia Protein Oatmeal Bowl',
        desc: 'Hearty rolled oats cooked with almond milk, topped with blueberries, chia seeds, and 1 scoop of whey protein.',
        calories: 480,
        macros: 'Protein: 34g | Carbs: 58g | Fat: 13g'
      },
      {
        mealType: 'Lunch',
        title: 'Turkey Avocado Whole-Grain Wrap',
        desc: 'Sliced roast turkey breast, crushed ripe avocado, mixed greens, and hummus wrapped in a large whole-grain tortilla.',
        calories: 620,
        macros: 'Protein: 45g | Carbs: 52g | Fat: 22g'
      },
      {
        mealType: 'Dinner',
        title: 'Lean Sirloin Steak with Sweet Potato',
        desc: '170g grilled lean sirloin steak, steamed broccoli florets with garlic butter, and a medium roasted sweet potato.',
        calories: 690,
        macros: 'Protein: 48g | Carbs: 50g | Fat: 21g'
      }
    ]
  },
  {
    tier: 'high',
    maxCalories: Infinity,
    planTitle: 'Performance & Surplus Plan (~2,600+ kcal)',
    meals: [
      {
        mealType: 'Breakfast',
        title: 'Power Eggs & Peanut Butter Sourdough',
        desc: '3 pasture-raised whole eggs, 2 slices toasted sourdough with natural peanut butter, and sliced banana.',
        calories: 720,
        macros: 'Protein: 38g | Carbs: 72g | Fat: 28g'
      },
      {
        mealType: 'Lunch',
        title: 'Mediterranean Herb Chicken & Rice Bowl',
        desc: '200g juicy chicken breast, 1.5 cups brown rice, roasted Mediterranean peppers, olives, and feta cheese.',
        calories: 840,
        macros: 'Protein: 56g | Carbs: 84g | Fat: 26g'
      },
      {
        mealType: 'Dinner',
        title: 'Hearty Lean Beef Pasta with Roasted Zucchini',
        desc: 'Extra-lean minced beef tossed with durum wheat pasta, rich tomato basil marinara, and grated parmesan.',
        calories: 890,
        macros: 'Protein: 58g | Carbs: 92g | Fat: 25g'
      }
    ]
  }
];

// Local storage key
const STORAGE_KEY = 'health_track_history_v1';

// DOM Elements
const bmiWeightInput = document.getElementById('bmi-weight');
const bmiHeightInput = document.getElementById('bmi-height');
const bmiWeightError = document.getElementById('bmi-weight-error');
const bmiHeightError = document.getElementById('bmi-height-error');
const btnCheckBmi = document.getElementById('btn-check-bmi');
const bmiOutput = document.getElementById('bmi-output');
const bmiStatusBadge = document.getElementById('bmi-status-badge');

const bmrWeightInput = document.getElementById('bmr-weight');
const bmrHeightInput = document.getElementById('bmr-height');
const bmrAgeInput = document.getElementById('bmr-age');
const bmrGenderSelect = document.getElementById('bmr-gender');
const bmrWeightError = document.getElementById('bmr-weight-error');
const bmrHeightError = document.getElementById('bmr-height-error');
const bmrAgeError = document.getElementById('bmr-age-error');
const bmrGenderError = document.getElementById('bmr-gender-error');
const btnCheckBmr = document.getElementById('btn-check-bmr');
const bmrOutput = document.getElementById('bmr-output');

const tdeeActivitySelect = document.getElementById('tdee-activity');
const tdeeActivityError = document.getElementById('tdee-activity-error');
const btnCheckTdee = document.getElementById('btn-check-tdee');
const tdeeOutput = document.getElementById('tdee-output');

const calorieGoalSelect = document.getElementById('calorie-goal');
const calorieGoalError = document.getElementById('calorie-goal-error');
const calorieOutput = document.getElementById('calorie-output');
const btnSaveLog = document.getElementById('btn-save-log');

const mealsContainer = document.getElementById('meals-container');
const mealsEmpty = document.getElementById('meals-empty');
const mealsGrid = document.getElementById('meals-grid');
const mealPlanBadge = document.getElementById('meal-plan-badge');

const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const btnClearHistory = document.getElementById('btn-clear-history');
const toastEl = document.getElementById('toast');

// Current state values
let currentBmi = null;
let currentBmr = null;
let currentTdee = null;
let currentCalorieTarget = null;

/**
 * Toast Notification Helper
 */
let toastTimeout;
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2800);
}

/**
 * Validation Helpers
 */
function validateWeight(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Weight is required';
  }
  const num = Number(value);
  if (isNaN(num)) {
    return 'Please enter a valid numeric value';
  }
  if (num < 0) {
    return 'Weight cannot be negative';
  }
  if (num < 20 || num > 300) {
    return 'Weight must be between 20 and 300 kg';
  }
  return '';
}

function validateHeight(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Height is required';
  }
  const num = Number(value);
  if (isNaN(num)) {
    return 'Please enter a valid numeric value';
  }
  if (num < 0) {
    return 'Height cannot be negative';
  }
  if (num < 50 || num > 250) {
    return 'Height must be between 50 and 250 cm';
  }
  return '';
}

function validateAge(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Age is required';
  }
  const num = Number(value);
  if (isNaN(num)) {
    return 'Please enter a valid numeric value';
  }
  if (num < 0) {
    return 'Age cannot be negative';
  }
  if (num < 1 || num > 100) {
    return 'Age must be between 1 and 100';
  }
  return '';
}

function validateGender(value) {
  if (!value || (value !== 'male' && value !== 'female')) {
    return 'Please select your gender';
  }
  return '';
}

function validateActivity(value) {
  if (!value) {
    return 'Please select an activity level';
  }
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return 'Please select a valid activity level';
  }
  return '';
}

function validateGoal(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Please select a fitness goal';
  }
  const num = Number(value);
  if (isNaN(num)) {
    return 'Please select a valid fitness goal';
  }
  return '';
}

/**
 * Display or clear errors on input fields
 */
function setFieldError(inputEl, errorEl, message) {
  if (errorEl) {
    errorEl.textContent = message;
  }
  if (inputEl) {
    if (message) {
      inputEl.classList.add('is-invalid');
    } else {
      inputEl.classList.remove('is-invalid');
    }
  }
}

/**
 * Two-way sync between BMI and BMR input values
 */
function syncHeight(source) {
  if (source === 'bmi') {
    bmrHeightInput.value = bmiHeightInput.value;
  } else {
    bmiHeightInput.value = bmrHeightInput.value;
  }
}

function syncWeight(source) {
  if (source === 'bmi') {
    bmrWeightInput.value = bmiWeightInput.value;
  } else {
    bmiWeightInput.value = bmrWeightInput.value;
  }
}

/**
 * Calculate BMI
 * Formula: weight / (height/100)^2
 * Display: 1 decimal
 */
function calculateBmi(showErrors = false) {
  const wVal = bmiWeightInput.value.trim();
  const hVal = bmiHeightInput.value.trim();

  const wErr = validateWeight(wVal);
  const hErr = validateHeight(hVal);

  if (showErrors || wVal !== '') {
    setFieldError(bmiWeightInput, bmiWeightError, wErr);
  }
  if (showErrors || hVal !== '') {
    setFieldError(bmiHeightInput, bmiHeightError, hErr);
  }

  if (wErr || hErr) {
    currentBmi = null;
    bmiOutput.textContent = 'Your BMI is -';
    bmiStatusBadge.style.display = 'none';
    return false;
  }

  const weight = Number(wVal);
  const height = Number(hVal);
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  if (bmi <= 0 || isNaN(bmi) || !isFinite(bmi)) {
    currentBmi = null;
    bmiOutput.textContent = 'Your BMI is -';
    bmiStatusBadge.style.display = 'none';
    return false;
  }

  currentBmi = Number(bmi.toFixed(1));
  bmiOutput.textContent = `Your BMI is ${currentBmi}`;

  // Classification badge
  let category = '';
  let badgeClass = '';
  if (currentBmi < 18.5) {
    category = 'Underweight';
    badgeClass = 'badge-warning';
  } else if (currentBmi < 25.0) {
    category = 'Normal weight';
    badgeClass = 'badge-normal';
  } else if (currentBmi < 30.0) {
    category = 'Overweight';
    badgeClass = 'badge-warning';
  } else {
    category = 'Obese';
    badgeClass = 'badge-danger';
  }

  bmiStatusBadge.textContent = category;
  bmiStatusBadge.className = `result-badge ${badgeClass}`;
  bmiStatusBadge.style.display = 'inline-block';
  return true;
}

/**
 * Calculate BMR (Mifflin-St Jeor)
 * Formula specified in prompt:
 * male: 10W + 6.25H - 5A - 5
 * female: 10W + 6.25H - 5A + 161
 * Display: whole number
 */
function calculateBmr(showErrors = false) {
  const wVal = bmrWeightInput.value.trim();
  const hVal = bmrHeightInput.value.trim();
  const aVal = bmrAgeInput.value.trim();
  const gVal = bmrGenderSelect.value;

  const wErr = validateWeight(wVal);
  const hErr = validateHeight(hVal);
  const aErr = validateAge(aVal);
  const gErr = validateGender(gVal);

  if (showErrors || wVal !== '') {
    setFieldError(bmrWeightInput, bmrWeightError, wErr);
  }
  if (showErrors || hVal !== '') {
    setFieldError(bmrHeightInput, bmrHeightError, hErr);
  }
  if (showErrors || aVal !== '') {
    setFieldError(bmrAgeInput, bmrAgeError, aErr);
  }
  if (showErrors || gVal !== '') {
    setFieldError(bmrGenderSelect, bmrGenderError, gErr);
  }

  if (wErr || hErr || aErr || gErr) {
    currentBmr = null;
    bmrOutput.textContent = 'Your BMR is -';
    // Cascading updates
    calculateTdee(false);
    return false;
  }

  const weight = Number(wVal);
  const height = Number(hVal);
  const age = Number(aVal);

  let bmr = 0;
  if (gVal === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 5;
  } else if (gVal === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 161;
  }

  // Prevent negative or invalid calculation
  if (bmr <= 0 || isNaN(bmr) || !isFinite(bmr)) {
    currentBmr = null;
    bmrOutput.textContent = 'Your BMR is -';
    calculateTdee(false);
    return false;
  }

  currentBmr = Math.round(bmr);
  bmrOutput.textContent = `Your BMR is ${currentBmr}`;

  // Recalculate downstream
  calculateTdee(false);
  return true;
}

/**
 * Calculate TDEE
 * Formula: BMR * activity multiplier
 * Activity: sedentary(1.2), light(1.37), moderate(1.55), active(1.725)
 * Display: whole number
 */
function calculateTdee(showErrors = false) {
  const actVal = tdeeActivitySelect.value;
  const actErr = validateActivity(actVal);

  if (showErrors || actVal !== '') {
    setFieldError(tdeeActivitySelect, tdeeActivityError, actErr);
  }

  if (actErr || !currentBmr) {
    currentTdee = null;
    tdeeOutput.textContent = 'Your TDEE is -';
    if (!currentBmr && showErrors) {
      setFieldError(tdeeActivitySelect, tdeeActivityError, 'Please complete BMR inputs first');
    }
    calculateCalorieTarget(false);
    return false;
  }

  const multiplier = Number(actVal);
  const tdee = currentBmr * multiplier;

  if (tdee <= 0 || isNaN(tdee) || !isFinite(tdee)) {
    currentTdee = null;
    tdeeOutput.textContent = 'Your TDEE is -';
    calculateCalorieTarget(false);
    return false;
  }

  currentTdee = Math.round(tdee);
  tdeeOutput.textContent = `Your TDEE is ${currentTdee}`;

  // Recalculate calorie target
  calculateCalorieTarget(false);
  return true;
}

/**
 * Calculate Calorie Target
 * Formula: TDEE + goal adjustment
 * Goal adjustment: lose(-500), maintain(0), gain(+500)
 * Display: whole number
 */
function calculateCalorieTarget(showErrors = false) {
  const goalVal = calorieGoalSelect.value;
  const goalErr = validateGoal(goalVal);

  if (showErrors || goalVal !== '') {
    setFieldError(calorieGoalSelect, calorieGoalError, goalErr);
  }

  if (goalErr || !currentTdee) {
    currentCalorieTarget = null;
    calorieOutput.textContent = 'Your Daily Calorie Target is -';
    if (!currentTdee && showErrors) {
      setFieldError(calorieGoalSelect, calorieGoalError, 'Please complete TDEE calculation first');
    }
    updateMealSuggestions(null);
    return false;
  }

  const adjustment = Number(goalVal);
  const target = currentTdee + adjustment;

  // Prevent invalid calculation and negative output
  if (target <= 0 || isNaN(target) || !isFinite(target)) {
    currentCalorieTarget = null;
    calorieOutput.textContent = 'Your Daily Calorie Target is -';
    setFieldError(calorieGoalSelect, calorieGoalError, 'Target calories cannot be negative');
    updateMealSuggestions(null);
    return false;
  }

  currentCalorieTarget = Math.round(target);
  calorieOutput.textContent = `Your Daily Calorie Target is ${currentCalorieTarget}`;

  updateMealSuggestions(currentCalorieTarget);
  return true;
}

/**
 * Update Meal Suggestions based on Calorie Target
 * Renders 3 mock meals from hardcoded array
 */
function updateMealSuggestions(targetCalories) {
  if (!targetCalories || targetCalories <= 0) {
    mealsEmpty.textContent = 'no data';
    mealsEmpty.style.display = 'block';
    mealsGrid.style.display = 'none';
    mealsGrid.innerHTML = '';
    mealPlanBadge.textContent = '';
    return;
  }

  // Pick matching plan
  let plan = MOCK_MEALS_DATA[0];
  if (targetCalories <= 1700) {
    plan = MOCK_MEALS_DATA[0];
  } else if (targetCalories <= 2300) {
    plan = MOCK_MEALS_DATA[1];
  } else {
    plan = MOCK_MEALS_DATA[2];
  }

  mealPlanBadge.textContent = `(${plan.planTitle})`;
  mealsEmpty.style.display = 'none';
  mealsGrid.innerHTML = '';

  plan.meals.forEach((meal) => {
    const card = document.createElement('div');
    card.className = 'meal-card';

    const header = document.createElement('div');
    header.className = 'meal-header';

    const title = document.createElement('span');
    title.className = 'meal-name';
    title.textContent = `${meal.mealType}: ${meal.title}`;

    const calBadge = document.createElement('span');
    calBadge.className = 'meal-cal';
    calBadge.textContent = `${meal.calories} kcal`;

    header.appendChild(title);
    header.appendChild(calBadge);

    const desc = document.createElement('p');
    desc.className = 'meal-desc';
    desc.textContent = meal.desc;

    const macros = document.createElement('div');
    macros.className = 'meal-macros';
    macros.textContent = meal.macros;

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(macros);

    mealsGrid.appendChild(card);
  });

  mealsGrid.style.display = 'grid';
}

/**
 * Safe LocalStorage Handlers
 */
function getHistoryRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function saveHistoryRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Render History Log List
 */
function renderHistory() {
  const records = getHistoryRecords();

  if (!records || records.length === 0) {
    historyList.innerHTML = '<div class="empty-state" id="history-empty">no data</div>';
    return;
  }

  historyList.innerHTML = '';

  records.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'history-item';
    row.setAttribute('data-id', item.id);

    const info = document.createElement('div');
    info.className = 'history-info';

    const dateSpan = document.createElement('div');
    dateSpan.className = 'history-date';
    dateSpan.textContent = item.date;

    const bmiSpan = document.createElement('div');
    bmiSpan.className = 'history-stat';
    bmiSpan.innerHTML = `BMI: <span>${item.bmi}</span>`;

    const calSpan = document.createElement('div');
    calSpan.className = 'history-stat';
    calSpan.innerHTML = `Calories: <span>${item.calorie} kcal</span>`;

    const detailSpan = document.createElement('div');
    detailSpan.className = 'history-stat';
    detailSpan.style.color = '#555555';
    detailSpan.style.fontWeight = 'normal';
    detailSpan.textContent = `(${item.weight}kg | ${item.height}cm | ${item.goalName})`;

    info.appendChild(dateSpan);
    info.appendChild(bmiSpan);
    info.appendChild(calSpan);
    info.appendChild(detailSpan);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-delete-entry';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', `Delete record from ${item.date}`);
    deleteBtn.addEventListener('click', () => {
      deleteHistoryEntry(item.id);
    });

    row.appendChild(info);
    row.appendChild(deleteBtn);
    historyList.appendChild(row);
  });
}

/**
 * Delete a single history entry by unique id
 * Deleting one entry must not affect other entries
 */
function deleteHistoryEntry(id) {
  const records = getHistoryRecords();
  const updated = records.filter((r) => r.id !== id);
  saveHistoryRecords(updated);
  renderHistory();
  showToast('Entry removed from history');
}

/**
 * Clear all history entries with confirmation
 */
function clearAllHistory() {
  const records = getHistoryRecords();
  if (records.length === 0) {
    showToast('History is already empty');
    return;
  }

  const confirmed = window.confirm('Are you sure you want to clear all history records?');
  if (confirmed) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // safe fallback
    }
    renderHistory();
    showToast('All history records cleared');
  }
}

/**
 * Save current calculation to History
 */
function saveCurrentToHistory() {
  // Validate all forms completely
  const isBmiValid = calculateBmi(true);
  const isBmrValid = calculateBmr(true);
  const isTdeeValid = calculateTdee(true);
  const isCalValid = calculateCalorieTarget(true);

  if (!isBmiValid || !isBmrValid || !isTdeeValid || !isCalValid) {
    showToast('Please fill all valid inputs before saving');
    return;
  }

  const goalText = calorieGoalSelect.options[calorieGoalSelect.selectedIndex]?.text.split('(')[0].trim() || 'Custom';
  const now = new Date();
  const dateFormatted = now.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' ' + now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    date: dateFormatted,
    bmi: currentBmi,
    bmr: currentBmr,
    tdee: currentTdee,
    calorie: currentCalorieTarget,
    weight: bmrWeightInput.value.trim(),
    height: bmrHeightInput.value.trim(),
    goalName: goalText
  };

  const records = getHistoryRecords();
  records.unshift(record); // add newest first
  saveHistoryRecords(records);
  renderHistory();
  showToast('Saved calculation to history log!');
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
  // BMI Weight Input
  bmiWeightInput.addEventListener('input', () => {
    syncWeight('bmi');
    calculateBmi(false);
    calculateBmr(false);
  });

  // BMI Height Input
  bmiHeightInput.addEventListener('input', () => {
    syncHeight('bmi');
    calculateBmi(false);
    calculateBmr(false);
  });

  // Check BMI Button
  btnCheckBmi.addEventListener('click', () => {
    calculateBmi(true);
  });

  // BMR Weight Input
  bmrWeightInput.addEventListener('input', () => {
    syncWeight('bmr');
    calculateBmi(false);
    calculateBmr(false);
  });

  // BMR Height Input
  bmrHeightInput.addEventListener('input', () => {
    syncHeight('bmr');
    calculateBmi(false);
    calculateBmr(false);
  });

  // BMR Age Input
  bmrAgeInput.addEventListener('input', () => {
    calculateBmr(false);
  });

  // BMR Gender Select
  bmrGenderSelect.addEventListener('change', () => {
    calculateBmr(false);
  });

  // Check BMR Button
  btnCheckBmr.addEventListener('click', () => {
    calculateBmr(true);
  });

  // TDEE Activity Select
  tdeeActivitySelect.addEventListener('change', () => {
    calculateTdee(false);
  });

  // Check TDEE Button
  btnCheckTdee.addEventListener('click', () => {
    calculateTdee(true);
  });

  // Calorie Goal Select
  calorieGoalSelect.addEventListener('change', () => {
    calculateCalorieTarget(false);
  });

  // Save to History Button
  btnSaveLog.addEventListener('click', () => {
    saveCurrentToHistory();
  });

  // Clear All History Button
  btnClearHistory.addEventListener('click', () => {
    clearAllHistory();
  });
}

// Initialize on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderHistory();
  updateMealSuggestions(null);
});
