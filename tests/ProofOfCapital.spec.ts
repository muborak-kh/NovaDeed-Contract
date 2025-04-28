import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { ProofOfCapital } from '../wrappers/ProofOfCapital';
import '@ton/test-utils';

describe('ProofOfCapital', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let proofOfCapital: SandboxContract<ProofOfCapital>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        proofOfCapital = blockchain.openContract(await ProofOfCapital.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await proofOfCapital.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null,
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: proofOfCapital.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and proofOfCapital are ready to use
    });
});
