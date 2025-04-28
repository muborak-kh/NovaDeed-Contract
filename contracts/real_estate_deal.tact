import "@stdlib/deploy";

// Объявляем сообщения
message DealParams {
    buyer: Address;
    builder: Address;
    amount: Int as coins;
    deadline: Int as uint64;
    propertyId: Int as uint256;
}

message SubmitDocs {
    hash: String;
}

message ResolveDecision {
    decision: Bool;
}

message TokenReceived {
    amount: Int as coins;
    from: Address;
}

// Сообщение для Jetton transfer (стандарт Jetton) (не нужно для нативного TON)
message JettonTransfer {
    queryId: Int as uint64;
    amount: Int as coins;
    destination: Address;
    responseDestination: Address?;
    customPayload: Cell?;
    forwardTonAmount: Int as coins;
    forwardPayload: Cell?;
}

contract RealEstateDeal {
    // Участники
    buyer: Address;
    builder: Address;
    dao: Address;

    // Параметры
    amount: Int as coins;
    deadline: Int as uint64;
    propertyId: Int as uint256;
    isCompleted: Bool = false;
    documentsHash: String? = null;
    balance: Int as coins = 0;

    init(params: DealParams, dao: Address) {
        require(params.amount > 0, "Amount must be positive");
        self.buyer = params.buyer;
        self.builder = params.builder;
        self.amount = params.amount;
        self.deadline = params.deadline;
        self.propertyId = params.propertyId;
        self.dao = dao;
    }

    // Получение токенов на контракт (для нативных TON это не требуется, так как транзакции идут напрямую)
    receive(msg: TokenReceived) {
        // Этот метод можно удалить, так как для нативных TON не нужен контракт токена
        // require(sender() == self.tokenRoot, "Only token contract can send");
        self.balance += msg.amount;
    }

    // Подтверждение от застройщика
    receive("confirm") {
        require(sender() == self.builder, "Only builder can confirm");
        require(!self.isCompleted, "Deal already completed");
        require(self.balance >= self.amount, "Not enough tokens deposited");
        self.documentsHash = null;
    }

    // Отправка документов
    receive(msg: SubmitDocs) {
        require(sender() == self.builder, "Only builder can submit docs");
        require(!self.isCompleted, "Deal already completed");
        self.documentsHash = msg.hash;
    }

    // Покупатель одобряет документы
    receive("approve") {
        require(sender() == self.buyer, "Only buyer can approve");
        require(self.documentsHash != null, "No documents submitted");
        require(!self.isCompleted, "Deal already completed");
        require(self.balance >= self.amount, "Insufficient balance");
        require(myBalance() >= ton("0.05"), "Insufficient TON for gas");

        self.sendToken(self.builder, self.amount);
        self.isCompleted = true;
    }

    // DAO принимает решение в случае спора
    receive(msg: ResolveDecision) {
        require(sender() == self.dao, "Only DAO can resolve");
        require(!self.isCompleted, "Deal already completed");
        require(self.balance >= self.amount, "Insufficient balance");
        require(myBalance() >= ton("0.05"), "Insufficient TON for gas");

        if (msg.decision) {
            self.sendToken(self.builder, self.amount);
        } else {
            self.sendToken(self.buyer, self.amount);
        }
        self.isCompleted = true;
    }

    // Покупатель запрашивает возврат по истечении дедлайна
    receive("timeout_refund") {
        require(now() > self.deadline, "Deadline not reached");
        require(!self.isCompleted, "Deal already completed");
        require(self.balance >= self.amount, "Insufficient balance");
        require(myBalance() >= ton("0.05"), "Insufficient TON for gas");

        self.sendToken(self.buyer, self.amount);
        self.isCompleted = true;
    }

    // Вспомогательная функция отправки токенов
    fun sendToken(to: Address, amount: Int) {
        // Отправка нативных TON на адрес застройщика или покупателя
        let params = SendParameters{
            to: to,
            value: amount, // Сумма в TON
            bounce: false,
            body: null  // Тело остается пустым, так как не нужно использовать JettonTransfer
        };
        send(params);
        self.balance -= amount; // Уменьшаем баланс после отправки
    }

    // Метод для пополнения TON для газа
    receive("top_up") {
        // Принимаем TON для газа
    }
}
