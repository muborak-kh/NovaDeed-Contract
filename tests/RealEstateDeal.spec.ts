import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { RealEstateDeal } from '../wrappers/RealEstateDeal';
import '@ton/test-utils';

describe('RealEstateDeal', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let realEstateDeal: SandboxContract<RealEstateDeal>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        realEstateDeal = blockchain.openContract(await RealEstateDeal.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await realEstateDeal.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: realEstateDeal.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and realEstateDeal are ready to use
    });
});
