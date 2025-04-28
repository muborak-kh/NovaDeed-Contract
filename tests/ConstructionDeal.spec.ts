import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { ConstructionDeal } from '../wrappers/ConstructionDeal';
import '@ton/test-utils';

describe('ConstructionDeal', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let constructionDeal: SandboxContract<ConstructionDeal>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        constructionDeal = blockchain.openContract(await ConstructionDeal.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await constructionDeal.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: constructionDeal.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and constructionDeal are ready to use
    });
});
