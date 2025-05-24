// 정산 관리 모듈
export class SettlementManager {
    constructor(participants, expenses) {
        this.participants = participants;
        this.expenses = expenses;
    }

    calculateSettlement() {
        const expenses = this.expenses.getExpenses();
        const participants = this.participants.getParticipants();
        
        // 각 참여자의 총 지출액과 부담액 계산
        const totalSpent = {};
        const totalShare = {};
        participants.forEach(name => {
            totalSpent[name] = 0;
            totalShare[name] = 0;
        });

        // 각 지출 항목별 계산
        expenses.forEach(expense => {
            const { amount, payer, excluded } = expense;
            
            // 제외된 참여자를 제외한 유효한 참여자 목록
            const validParticipants = participants.filter(p => !excluded.includes(p));
            
            // 지불자에게 지출액 추가
            totalSpent[payer] += amount;

            // 각 참여자의 부담액 계산
            if (validParticipants.length > 0) {
                // 제외된 참여자를 제외한 인원으로 나누기
                const sharePerPerson = Math.floor(amount / validParticipants.length);
                const remainder = amount - (sharePerPerson * validParticipants.length);

                // 유효한 참여자들에게만 부담액 할당
                validParticipants.forEach(participant => {
                    totalShare[participant] += sharePerPerson;
                });

                // 나머지 금액은 지불자에게 추가
                totalShare[payer] += remainder;
            }
        });

        // 최종 정산 금액 계산
        const settlements = [];
        participants.forEach(name => {
            const balance = totalSpent[name] - totalShare[name];
            settlements.push({
                name,
                spent: totalSpent[name],
                share: totalShare[name],
                balance
            });
        });

        // 정산 방법 계산
        const methods = this.calculateSettlementMethods(settlements);

        return {
            expenses,
            settlements,
            methods
        };
    }

    calculateSettlementMethods(settlements) {
        const methods = [];
        const debtors = settlements.filter(s => s.balance < 0)
            .sort((a, b) => a.balance - b.balance);
        const creditors = settlements.filter(s => s.balance > 0)
            .sort((a, b) => b.balance - a.balance);

        while (debtors.length > 0 && creditors.length > 0) {
            const debtor = debtors[0];
            const creditor = creditors[0];
            const amount = Math.min(-debtor.balance, creditor.balance);

            if (amount > 0) {  // 0원이 아닌 경우에만 정산 방법 추가
                methods.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount
                });
            }

            debtor.balance += amount;
            creditor.balance -= amount;

            if (debtor.balance === 0) debtors.shift();
            if (creditor.balance === 0) creditors.shift();
        }

        return methods;
    }

    createSettlementResult(result) {
        const resultContent = document.createElement('div');
        resultContent.className = 'result-content';

        // 지출 내역 섹션
        const expenseDetails = document.createElement('div');
        expenseDetails.className = 'expense-details';
        
        const expenseHeader = document.createElement('h3');
        expenseHeader.textContent = '지출 내역';
        expenseDetails.appendChild(expenseHeader);

        const expenseTable = document.createElement('table');
        expenseTable.className = 'expense-table';
        expenseTable.innerHTML = `
            <thead>
                <tr>
                    <th class="expense-header-title">항목</th>
                    <th class="expense-header-amount">금액</th>
                    <th class="expense-header-payer">지불자</th>
                    <th class="expense-header-excluded">제외</th>
                </tr>
            </thead>
            <tbody>
                ${result.expenses.map(expense => `
                    <tr>
                        <td class="expense-title">${expense.name}</td>
                        <td class="expense-amount">${expense.amount.toLocaleString()}원</td>
                        <td class="expense-payer">${expense.payer}</td>
                        <td class="expense-excluded">${expense.excluded.length > 0 ? `제외: ${expense.excluded.join(', ')}` : ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        expenseDetails.appendChild(expenseTable);

        resultContent.appendChild(expenseDetails);

        // 오른쪽 컨테이너 (정산 결과 + 정산 방법)
        const settlementContainer = document.createElement('div');
        settlementContainer.className = 'settlement-container';

        // 정산 결과 섹션
        const settlementDetails = document.createElement('div');
        settlementDetails.className = 'settlement-details';
        
        const settlementResultHeader = document.createElement('h3');
        settlementResultHeader.textContent = '정산 결과';
        settlementDetails.appendChild(settlementResultHeader);

        result.settlements.forEach(settlement => {
            const settlementItem = document.createElement('div');
            settlementItem.className = 'settlement-card';
            
            const settlementName = document.createElement('div');
            settlementName.className = 'settlement-name';
            settlementName.textContent = settlement.name;
            settlementItem.appendChild(settlementName);

            const settlementInfo = document.createElement('div');
            settlementInfo.className = 'settlement-info';
            const balance = settlement.spent - settlement.share;
            settlementInfo.innerHTML = `
                <div class="settlement-amount">
                    <span class="amount-label">지출</span>
                    <span class="amount-value">${settlement.spent.toLocaleString()}원</span>
                </div>
                <div class="settlement-amount">
                    <span class="amount-label">부담</span>
                    <span class="amount-value">${settlement.share.toLocaleString()}원</span>
                </div>
                <div class="settlement-divider"></div>
                <div class="settlement-balance ${balance > 0 ? 'positive' : 'negative'}">
                    <span class="amount-label">결과</span>
                    <span class="amount-value">${balance > 0 ? '+' : ''}${balance.toLocaleString()}원</span>
                </div>
            `;
            settlementItem.appendChild(settlementInfo);
            settlementDetails.appendChild(settlementItem);
        });

        settlementContainer.appendChild(settlementDetails);

        // 정산 방법 섹션
        const settlementMethods = document.createElement('div');
        settlementMethods.className = 'settlement-methods';
        
        const settlementHeader = document.createElement('h3');
        settlementHeader.textContent = '정산 방법';
        settlementMethods.appendChild(settlementHeader);

        result.methods.forEach(method => {
            const methodItem = document.createElement('div');
            methodItem.className = 'method-item';
            methodItem.innerHTML = `
                <span class="method-detail">
                    <span class="from participant-name">${method.from}</span>
                    <span class="method-arrow">→</span>
                    <span class="to participant-name">${method.to}</span>
                </span>
                <span class="method-amount">${method.amount.toLocaleString()}원</span>
            `;
            settlementMethods.appendChild(methodItem);
        });

        settlementContainer.appendChild(settlementMethods);
        resultContent.appendChild(settlementContainer);
        return resultContent;
    }
} 