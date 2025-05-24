// 지출 관리 모듈
export class ExpensesManager {
    constructor(container, addButton, participants) {
        this.container = container;
        this.addButton = addButton;
        this.participants = participants;
        this.expenses = [];
        this.excludedParticipants = new Map(); // 제외된 참여자 정보를 저장할 Map
        this.setupEventListeners();
        console.log('ExpensesManager initialized');
    }

    setupEventListeners() {
        this.addButton.addEventListener('click', () => {
            console.log('지출 항목 추가 버튼 클릭됨 (ExpensesManager)');
            this.addExpense();
        });
    }

    addExpense(defaultName = '') {
        console.log('addExpense 메서드 호출');
        const expenseItem = this.createExpenseItem(defaultName);
        console.log('생성된 expenseItem:', expenseItem);
        this.container.appendChild(expenseItem);
        console.log('expenseItem 추가됨');
    }

    createExpenseItem(defaultName) {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.innerHTML = `
            <input type="text" placeholder="항목" class="expense-name" value="${defaultName}">
            <input type="text" placeholder="금액" class="expense-amount" inputmode="numeric">
            <select class="payer-select">
                <option value="">지불자 선택</option>
            </select>
            <button class="exclude-toggle">제외</button>
            <button class="remove-button" title="항목 삭제">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;

        this.setupExpenseItemEvents(expenseItem);
        this.updatePayerOptions(expenseItem);

        return expenseItem;
    }

    setupExpenseItemEvents(expenseItem) {
        const amountInput = expenseItem.querySelector('.expense-amount');
        amountInput.addEventListener('input', () => this.addCommaToNumber(amountInput));
        amountInput.addEventListener('blur', () => this.addCommaToNumber(amountInput));

        const excludeToggle = expenseItem.querySelector('.exclude-toggle');
        excludeToggle.addEventListener('click', () => this.toggleExcludeParticipants(expenseItem, excludeToggle));

        const removeButton = expenseItem.querySelector('.remove-button');
        removeButton.addEventListener('click', () => expenseItem.remove());
    }

    addCommaToNumber(input) {
        const value = input.value.replace(/,/g, '');
        if (value === '') return;
        const number = parseInt(value);
        if (!isNaN(number)) {
            input.value = number.toLocaleString();
        }
    }

    toggleExcludeParticipants(expenseItem, excludeToggle) {
        const existingPopup = expenseItem.querySelector('.exclude-participants');
        if (existingPopup) {
            existingPopup.remove();
            return;
        }

        const excludeParticipants = document.createElement('div');
        excludeParticipants.className = 'exclude-participants';
        excludeParticipants.innerHTML = `
            <div class="exclude-checkboxes">
                ${this.participants.getParticipants().map(name => `
                    <label>
                        <input type="checkbox" class="exclude-checkbox" value="${name}"
                            ${this.excludedParticipants.get(expenseItem)?.includes(name) ? 'checked' : ''}>
                        ${name}
                    </label>
                `).join('')}
            </div>
        `;
        expenseItem.appendChild(excludeParticipants);
        excludeParticipants.classList.add('show');

        this.setupExcludeCheckboxes(excludeParticipants, excludeToggle, expenseItem);
    }

    setupExcludeCheckboxes(excludeParticipants, excludeToggle, expenseItem) {
        const checkboxes = excludeParticipants.querySelectorAll('.exclude-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const excludedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
                excludeToggle.classList.toggle('has-excluded', excludedCount > 0);
                excludeToggle.textContent = excludedCount > 0 ? `${excludedCount}명 제외` : '제외';
                
                // 제외된 참여자 정보 저장
                const excluded = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                this.excludedParticipants.set(expenseItem, excluded);
            });
        });

        document.addEventListener('click', function closeExclude(e) {
            if (!excludeParticipants.contains(e.target) && e.target !== excludeToggle) {
                excludeParticipants.remove();
                document.removeEventListener('click', closeExclude);
            }
        });
    }

    updatePayerOptions(expenseItem) {
        const payerSelect = expenseItem.querySelector('.payer-select');
        payerSelect.innerHTML = `
            <option value="">지불자 선택</option>
            ${this.participants.getParticipants().map(name => `<option value="${name}">${name}</option>`).join('')}
        `;
    }

    getExpenses() {
        return Array.from(this.container.querySelectorAll('.expense-item')).map(item => ({
            name: item.querySelector('.expense-name').value.trim(),
            amount: parseInt(item.querySelector('.expense-amount').value.replace(/,/g, '')),
            payer: item.querySelector('.payer-select').value,
            excluded: this.excludedParticipants.get(item) || []
        }));
    }

    validateExpenses() {
        const expenses = this.getExpenses();
        console.log('Validating expenses:', expenses);
        const isValid = expenses.every(expense => 
            expense.name && 
            expense.amount > 0 && 
            expense.payer
        );
        console.log('Validation result:', isValid);
        return isValid;
    }
} 