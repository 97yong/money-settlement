import { ParticipantsManager } from './participants.js';
import { ExpensesManager } from './expenses.js';
import { SettlementManager } from './settlement.js';

class App {
    constructor() {
        this.initializeElements();
        this.initializeManagers();
        this.setupEventListeners();
        this.initializeDefaultData();
    }

    initializeElements() {
        // 섹션 요소
        this.participantsSection = document.querySelector('.participants-section');
        this.expensesSection = document.querySelector('.expenses-section');
        this.resultSection = document.querySelector('#result-section');

        // 버튼 요소
        this.addParticipantBtn = document.querySelector('#addParticipantBtn');
        this.confirmParticipantsBtn = document.querySelector('#confirmParticipantsBtn');
        this.addExpenseBtn = document.querySelector('#addExpenseBtn');
        this.settleExpensesBtn = document.querySelector('#settleExpensesBtn');
        this.backButton = document.querySelector('.back-button');

        // 컨테이너 요소
        this.participantsContainer = document.querySelector('.participants-container');
        this.expensesContainer = document.querySelector('.expenses-container');
        this.resultContainer = document.querySelector('#result-container');
    }

    initializeManagers() {
        this.participantsManager = new ParticipantsManager(
            this.participantsContainer,
            this.addParticipantBtn,
            this.confirmParticipantsBtn
        );

        this.expensesManager = new ExpensesManager(
            this.expensesContainer,
            this.addExpenseBtn,
            this.participantsManager
        );

        this.settlementManager = new SettlementManager(
            this.participantsManager,
            this.expensesManager
        );
    }

    setupEventListeners() {
        this.settleExpensesBtn.addEventListener('click', () => this.handleSettlement());
        this.backButton.addEventListener('click', () => this.handleBack());
        this.confirmParticipantsBtn.addEventListener('click', () => this.handleConfirmParticipants());
        
        // 참여자 입력 필드 변경 감지
        this.participantsContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('participant-name')) {
                this.updatePayerOptions();
            }
        });
    }

    updatePayerOptions() {
        const expenseItems = this.expensesContainer.querySelectorAll('.expense-item');
        expenseItems.forEach(item => {
            const payerSelect = item.querySelector('.payer-select');
            const participants = this.participantsManager.getParticipants();
            payerSelect.innerHTML = `
                <option value="">지불자 선택</option>
                ${participants.map(name => `<option value="${name}">${name}</option>`).join('')}
            `;
        });
    }

    handleSettlement() {
        if (!this.expensesManager.validateExpenses()) {
            alert('모든 지출 항목을 입력해주세요.');
            return;
        }

        this.showResult();
        this.showLoading();

        setTimeout(() => {
            const result = this.settlementManager.calculateSettlement();
            const resultContent = this.settlementManager.createSettlementResult(result);
            
            this.resultContainer.innerHTML = '';
            this.resultContainer.appendChild(resultContent);
        }, 1000);
    }

    handleBack() {
        if (this.resultSection.classList.contains('hidden')) {
            // 지출 내역에서 참여자 섹션으로 돌아가기
            this.expensesSection.classList.remove('show');
            this.participantsSection.classList.remove('confirmed');
            this.backButton.classList.add('hidden');
        } else {
            // 결과에서 지출 내역으로 돌아가기
            this.hideResult();
        }
    }

    handleConfirmParticipants() {
        if (this.participantsManager.confirmParticipants()) {
            this.showExpenses();
            this.updatePayerOptions();
        }
    }

    showLoading() {
        this.resultContainer.innerHTML = `
            <div class="skeleton-loading">
                <div class="skeleton-expense-details">
                    <div class="skeleton-header"></div>
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                </div>
                <div class="skeleton-settlement-details">
                    <div class="skeleton-header"></div>
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                </div>
            </div>
        `;
    }

    hideLoading() {
        const loading = this.resultContainer.querySelector('.skeleton-loading');
        if (loading) {
            loading.remove();
        }
    }

    showResult() {
        this.participantsSection.classList.add('hidden');
        this.expensesSection.classList.remove('show');
        this.resultSection.classList.remove('hidden');
        this.backButton.classList.remove('hidden');
    }

    hideResult() {
        this.resultSection.classList.add('hidden');
        this.expensesSection.classList.add('show');
        this.participantsSection.classList.remove('hidden');
        this.backButton.classList.add('hidden');
    }

    showExpenses() {
        this.participantsSection.classList.add('confirmed');
        this.expensesSection.classList.add('show');
    }

    initializeDefaultData() {
        // 기본 참여자 2칸 추가
        for (let i = 0; i < 2; i++) {
            this.participantsManager.addParticipant();
        }

        // 기본 지출 내역 3칸 추가
        for (let i = 0; i < 3; i++) {
            this.expensesManager.addExpense();
        }
    }
}

// 조회수 관리 클래스
class ViewCounter {
    constructor() {
        this.todayKey = 'today_views';
        this.totalKey = 'total_views';
        this.lastVisitKey = 'last_visit';
        this.init();
    }

    init() {
        this.loadViews();
        this.updateViews();
        this.updateDisplay();
    }

    loadViews() {
        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem(this.lastVisitKey);

        // 마지막 방문이 오늘이 아니면 오늘 조회수 초기화
        if (lastVisit !== today) {
            localStorage.setItem(this.todayKey, '0');
            localStorage.setItem(this.lastVisitKey, today);
        }

        this.todayViews = parseInt(localStorage.getItem(this.todayKey)) || 0;
        this.totalViews = parseInt(localStorage.getItem(this.totalKey)) || 0;
    }

    updateViews() {
        this.todayViews++;
        this.totalViews++;
        localStorage.setItem(this.todayKey, this.todayViews.toString());
        localStorage.setItem(this.totalKey, this.totalViews.toString());
    }

    updateDisplay() {
        const todayElement = document.querySelector('.today-count');
        const totalElement = document.querySelector('.total-count');

        if (todayElement && totalElement) {
            todayElement.textContent = this.todayViews.toLocaleString();
            totalElement.textContent = this.totalViews.toLocaleString();
        }
    }
}

// 페이지 로드 시 조회수 카운터 초기화
document.addEventListener('DOMContentLoaded', () => {
    new ViewCounter();
    new App();
}); 