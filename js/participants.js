// 참여자 관리 모듈
export class ParticipantsManager {
    constructor(container, addButton, confirmButton) {
        this.container = container;
        this.addButton = addButton;
        this.confirmButton = confirmButton;
        this.participants = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.addButton.addEventListener('click', () => this.addParticipant());
        this.container.addEventListener('click', (e) => this.handleContainerClick(e));
        this.confirmButton.addEventListener('click', () => this.confirmParticipants());
    }

    addParticipant(defaultName = '') {
        const participantInput = document.createElement('div');
        participantInput.className = 'participant-input';
        participantInput.innerHTML = `
            <input type="text" placeholder="참여자 이름" class="participant-name" value="${defaultName}">
            <button class="remove-button" title="참여자 삭제">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;
        this.container.appendChild(participantInput);
    }

    handleContainerClick(e) {
        if (e.target.closest('.remove-button')) {
            const participantInput = e.target.closest('.participant-input');
            if (this.container.children.length > 1) {
                participantInput.remove();
            }
        }
    }

    confirmParticipants() {
        this.participants = Array.from(this.container.querySelectorAll('.participant-name'))
            .map(input => input.value.trim())
            .filter(name => name !== '');

        if (this.participants.length < 2) {
            alert('최소 2명 이상의 참여자가 필요합니다.');
            return false;
        }

        if (new Set(this.participants).size !== this.participants.length) {
            alert('중복된 참여자 이름이 있습니다.');
            return false;
        }

        return true;
    }

    getParticipants() {
        return this.participants;
    }
} 