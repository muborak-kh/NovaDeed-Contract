import { Address, toNano } from "@ton/core";
import { RealEstateDeal } from "../build/RealEstateDeal/tact_RealEstateDeal";
import { NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    
    // Параметры для контракта
    const buyerAddress = Address.parse(await ui.input("Buyer address:"));
    const builderAddress = Address.parse(await ui.input("Builder address:"));
    const daoAddress = Address.parse(await ui.input("DAO address:"));
    const amount = BigInt(await ui.input("Amount in Ton (in nano, e.g., 1000000000 for 1 TON):")); 
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60);
    const propertyId = BigInt(await ui.input("Property ID:"));  // Преобразуем в BigInt

    const dealParams = {
        $$type: 'DealParams' as const,
        buyer: buyerAddress,
        builder: builderAddress,
        amount: amount,
        deadline: deadline, // Передаем как BigInt
        propertyId: propertyId,  // Передаем как BigInt
    };

    const deal = provider.open(await RealEstateDeal.fromInit(dealParams, daoAddress));

    await deal.send(
        provider.sender(),
        { value: toNano("0.05") },
        "confirm" // <-- корректное сообщение
    );

    let deployed = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (await provider.isContractDeployed(deal.address)) {
      deployed = true;
      break;
    }
  }

  if (deployed) {
    ui.write(`Deal deployed at: ${deal.address}`);
    ui.write(`Please send at least ${amount} nanoTON to this address to fund the deal`);
  } else {
    ui.write('Failed to confirm deployment');
  }

}
