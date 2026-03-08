/* =========================
   DEVZEN — PRICING.JS (INR VERSION)
   ========================= */

/* ── PLAN DATA ── */
/* ── UPDATED PLAN DATA (AFFORDABLE TIER) ── */
const PLANS = {
    free: {
        name: 'Free',
        icon: '🌱',
        monthlyPrice: 0,
        annualPrice: 0,
        color: 'var(--teal)',
        ctaClass: 'cta-free',
        ctaText: 'Get Started Free',
        modalClass: 'modal-free',
        modalConfirmText: 'Activate Free Plan',
        modalConfirmBg: 'linear-gradient(135deg, var(--teal), #00b4d8)',
        modalConfirmColor: 'var(--void)',
        sub: 'No credit card required',
    },
    pro: {
        name: 'Pro',
        icon: '⚡',
        monthlyPrice: 199,
        annualPrice: 149, // Calculated at ~25% off
        color: 'var(--gold)',
        ctaClass: 'cta-pro',
        ctaText: 'Start Pro Trial',
        modalClass: 'modal-pro',
        modalConfirmText: 'Start 7-Day Free Trial',
        modalConfirmBg: 'linear-gradient(135deg, var(--gold), #ffaa00)',
        modalConfirmColor: 'var(--void)',
        sub: '7-day free trial · Cancel anytime',
    },
    elite: {
        name: 'Elite',
        icon: '👑',
        monthlyPrice: 399,
        annualPrice: 299, // Calculated at ~25% off
        color: 'var(--purple)',
        ctaClass: 'cta-elite',
        ctaText: 'Go Elite',
        modalClass: 'modal-elite',
        modalConfirmText: 'Unlock Elite Access',
        modalConfirmBg: 'linear-gradient(135deg, var(--purple), #7b2ff7)',
        modalConfirmColor: 'var(--white)',
        sub: '7-day free trial · Cancel anytime',
    },
};

/* ── STATE ── */
let isAnnual = false;
let currentPlan = localStorage.getItem('dz_plan') || 'free';
let activatingPlan = null;

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
    updateNavPlan();
    markCurrentPlan();
    bindBillingToggle();
    updatePrices();
});

/* ── BILLING TOGGLE ── */
function bindBillingToggle() {
    const toggle = document.getElementById('billingToggle');
    const labelM = document.getElementById('labelMonthly');
    const labelA = document.getElementById('labelAnnual');

    if (!toggle) return;

    toggle.addEventListener('change', () => {
        isAnnual = toggle.checked;
        if (labelM) labelM.classList.toggle('active', !isAnnual);
        if (labelA) labelA.classList.toggle('active', isAnnual);
        updatePrices();
    });
}

function updatePrices() {
    Object.entries(PLANS).forEach(([key, plan]) => {
        const priceEl = document.getElementById(`price-${key}`);
        const origEl = document.getElementById(`orig-${key}`);

        if (!priceEl) return;

        const display = isAnnual ? plan.annualPrice : plan.monthlyPrice;
        priceEl.textContent = "₹" + display;

        if (origEl) {
            // Show the original monthly price as a strike-through when annual is selected
            if (isAnnual && plan.monthlyPrice > 0) {
                origEl.textContent = "₹" + plan.monthlyPrice;
                origEl.classList.add('show');
            } else {
                origEl.classList.remove('show');
            }
        }
    });
}

/* ── MARK CURRENT PLAN ── */
function markCurrentPlan() {
    ['free', 'pro', 'elite'].forEach(key => {
        const el = document.getElementById(`currentTag-${key}`);
        if (!el) return;

        if (key === currentPlan) {
            el.innerHTML = `
                <div class="current-plan-tag">
                    <span style="width:6px;height:6px;border-radius:50%;background:var(--teal);box-shadow:0 0 6px var(--teal);flex-shrink:0;"></span>
                    Current Plan
                </div>`;
        } else {
            el.innerHTML = '';
        }
    });
}

function updateNavPlan() {
    const nav = document.getElementById('currentPlanNav');
    const plan = PLANS[currentPlan];

    if (!plan || !nav) return;

    nav.innerHTML = `<span style="color:${plan.color};">${plan.icon} ${plan.name}</span>`;
}

/* ── MODAL LOGIC ── */
function openModal(planKey) {
    const plan = PLANS[planKey];
    if (!plan) return;
    
    activatingPlan = planKey;

    const modalOverlay = document.getElementById('modalOverlay');
    const modalBox = document.getElementById('modalBox');
    
    if (modalBox) modalBox.className = `modal ${plan.modalClass}`;

    document.getElementById('modalIcon').textContent = plan.icon;
    document.getElementById('modalTitle').textContent = `Activate ${plan.name}`;
    document.getElementById('modalTitle').style.color = plan.color;
    document.getElementById('modalSub').textContent = plan.sub;

    const confirmBtn = document.getElementById('modalConfirm');
    confirmBtn.textContent = plan.modalConfirmText;
    confirmBtn.style.background = plan.modalConfirmBg;
    confirmBtn.style.color = plan.modalConfirmColor;
    confirmBtn.style.border = 'none';

    const nameInput = document.getElementById('modalName');
    const emailInput = document.getElementById('modalEmail');

    if (planKey === 'free') {
        if (nameInput) nameInput.style.display = 'none';
        if (emailInput) emailInput.style.display = 'none';
    } else {
        if (nameInput) {
            nameInput.style.display = '';
            nameInput.value = '';
        }
        if (emailInput) {
            emailInput.style.display = '';
            emailInput.value = '';
        }
    }

    if (modalOverlay) modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
    activatingPlan = null;
}

/* ── CONFIRM PLAN ── */
function confirmPlan() {
    if (!activatingPlan) return;

    const plan = PLANS[activatingPlan];

    if (activatingPlan !== 'free') {
        const emailInput = document.getElementById('modalEmail');
        const nameInput = document.getElementById('modalName');
        const email = emailInput ? emailInput.value.trim() : "";
        const name = nameInput ? nameInput.value.trim() : "";

        if (!name || !email || !email.includes('@')) {
            flashModalInput(!name ? 'modalName' : 'modalEmail');
            return;
        }
    }

    currentPlan = activatingPlan;
    localStorage.setItem('dz_plan', currentPlan);

    closeModal();

    // Ensure these helper functions exist in your main UI script
    if (typeof launchConfetti === 'function') launchConfetti(plan.color);
    
    markCurrentPlan();
    updateNavPlan();

    if (typeof showToast === 'function') {
        showToast(`${plan.icon} ${plan.name} plan activated!`, plan.color);
    }
}

/* ── INPUT FLASH ── */
function flashModalInput(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.style.borderColor = 'var(--magenta)';
    el.style.boxShadow = '0 0 0 3px rgba(255,45,120,0.1)';
    el.focus();

    setTimeout(() => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
    }, 1000);
}