const chains = [
    {
        name: 'Ethereum',
        apiUrl: 'https://api.etherscan.io/api',
        apiKey: 'Y26A71EHZFT46NQ8X5H72E9RQ27G8IYEWF',
        explorer: 'etherscan.io'
    },
    {
        name: 'Arbitrum',
        apiUrl: 'https://api.arbiscan.io/api',
        apiKey: 'YOUR_ARB_API_KEY',
        explorer: 'arbiscan.io'
    },
    {
        name: 'Optimism',
        apiUrl: 'https://api-optimistic.etherscan.io/api',
        apiKey: 'YOUR_OPT_API_KEY',
        explorer: 'optimistic.etherscan.io'
    },
    {
        name: 'ZKsync',
        apiUrl: 'https://api.zksync.io/api',
        apiKey: 'YOUR_ZKSYNC_API_KEY',
        explorer: 'explorer.zksync.io'
    },
    {
        name: 'Base',
        apiUrl: 'https://api.basescan.org/api',
        apiKey: 'UI6QAJPR9DD1QQDGN7DQC147HITW1V5PEW',
        explorer: 'basescan.org'
    },
    {
        name: 'Zora',
        apiUrl: 'https://explorer.zora.energy/api',
        apiKey: 'YOUR_ZORA_API_KEY',
        explorer: 'explorer.zora.energy'
    },
    {
        name: 'Linea',
        apiUrl: 'https://api.lineascan.build/api',
        apiKey: 'K54C2D1NTDUDQ5DVGQMWMXCJ589EFJEYVZ',
        explorer: 'lineascan.build'
    }
];

let ethPrice = 0;
let totalFees = { eth: 0, usd: 0 };

document.getElementById('walletAddress').addEventListener('input', async (e) => {
    const address = e.target.value.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return;

    totalFees = { eth: 0, usd: 0 };
    ethPrice = await getEthPrice();
    
    const results = document.getElementById('results');
    results.innerHTML = chains.map(chain => `
        <div class="table-row loading" id="${chain.name}">
            <div>${chain.name}</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div class="loading-bar"></div>
        </div>
    `).join('');

    chains.forEach(chain => checkChain(chain, address));
});

async function checkChain(chain, address) {
    try {
        const response = await fetch(`${chain.apiUrl}?module=account&action=txlist&address=${address}&apikey=${chain.apiKey}`);
        const data = await response.json();
        
        if (data.status === "1") {
            const outgoingTxs = data.result.filter(tx => tx.from.toLowerCase() === address.toLowerCase());
            const fees = outgoingTxs.reduce((sum, tx) => sum + (tx.gasUsed * tx.gasPrice), 0) / 1e18;
            
            updateChainResult(chain.name, outgoingTxs.length, fees);
            updateTotals(fees);
        }
    } catch (error) {
        console.error(`Error fetching ${chain.name}:`, error);
    }
}

function updateChainResult(chainName, txCount, fees) {
    const row = document.getElementById(chainName);
    if (!row) return;

    row.classList.remove('loading');
    row.innerHTML = `
        <div>${chainName}</div>
        <div>${txCount}</div>
        <div>${fees.toFixed(6)}</div>
        <div>$${(fees * ethPrice).toFixed(2)}</div>
    `;
}

function updateTotals(fees) {
    totalFees.eth += fees;
    totalFees.usd += fees * ethPrice;
    
    const totalRow = document.getElementById('total-row');
    totalRow.innerHTML = `
        <div>Total</div>
        <div>-</div>
        <div>${totalFees.eth.toFixed(6)}</div>
        <div>$${totalFees.usd.toFixed(2)}</div>
    `;
}

async function getEthPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        return data.ethereum.usd;
    } catch (error) {
        console.error('Error fetching ETH price:', error);
        return 0;
    }
}
