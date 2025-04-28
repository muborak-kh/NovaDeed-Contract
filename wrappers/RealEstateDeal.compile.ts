import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/real_estate_deal.tact',
    options: {
        debug: true,
    },
};
