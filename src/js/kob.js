const config = {
    'ROP': {
        id: 3,
        type: 'ropsten',
        contract: '0xa9aB26D85c5acD33De6F81B320535dBbAFDCD00F',
        provider: 'https://ropsten.infura.io/v3/92cbc81eeb984059a8f0bcf67c4ba265',
        currency: 'ETH',
        name: 'Ropsten',
        charities: {
            '0x70E3E494D5C1f12334aC27BAeF34Fb8D7A8405aD': 'Cuaras Charity',
            '0x629ccb33ad566d084366c592e70E60a0aCFE6449': 'Danir Charity',
            '0x5C85babA0A81DE6b2C324f0486e3497Bd2f51681': 'PP Charity',
        }
    },
    // 'LCL': {
    //     id: 5777,
    //     type: 'private',
    //     contract: '0xdB04A6E0f75c815B142E0b8D3710925261B2a784',
    //     provider: 'http://localhost:9545',
    //     currency: 'ETH',
    //     name: 'localhost',
    //     charities: {
    //         '0x735BCdB848505D0F12E6c0FCBC832B3897C9F3E8': 'Charity 9',
    //     },
    // },
}

let chain = window.localStorage.getItem('chain') || Object.keys(config)[0];

EMPTY_BID = {
    bid: 0,
    message: '',
    uri: '',
    charity: 0,
}

function toWei(amount) {
    return Number(amount) * 10**18;
}

function date2String(date) {
    return new Date(parseInt(date, 10)*1000).toLocaleString();
}

async function changeChain(newChain) {
    if(newChain !== chain) {
        await window.localStorage.setItem('chain', newChain);
        window.location.reload();
    }
}

async function isConnected() {
    const id = web3.eth.net.getId();
    const type = web3.eth.net.getNetworkType();
    const res = await Promise.all([id, type]);
    if(res[0] === config[chain].id && res[1] === config[chain].type) {
        return true;
    }
    return false;
}

async function init() {
    if (window.ethereum) {
        web3Provider = window.ethereum;
    try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
    } catch (error) {
        // User denied account access...
        console.error("User denied account access")
    }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Truffle Develop
    else {
        web3Provider = new Web3.providers.HttpProvider(config[chain].provider);
    }
    web3 = new Web3(web3Provider);
    const contract = await (await fetch('/contracts/KingOfTheBlockchain.json')).json();
    const Kob = new web3.eth.Contract(
        contract.abi,
        config[chain].contract
    );
    return [web3, Kob];
}

document.addEventListener('alpine:init', async () => { 
    let Kob;
    let web3;
    Alpine.data('chainData', () => ({
        async init() {
            // Initialize with correct chain here.
            this.chain = chain;
        }
    }))
    Alpine.data('getTopBids', () => ({
        open: false,
        topBids: [],
        charities: [],
        maxBid: 0,
        newBid: { ...EMPTY_BID },
        isConnected: false,
        message: {
            show: false,
            type: '',
            text: '',
        },
        async getCharities(){
            this.charities = await Kob.methods.getCharities();
        },
        async makeBid(bid, message, uri, charity) {
            const address = (await web3.eth.getAccounts())[0];
            Kob.methods.makeBid(message, uri, charity).send({
                from: address,
                value: web3.utils.toWei(`${bid}`, 'ether'),
            }).then(async (res)=>{
                console.log(res);
                const allBids = await Kob.methods.getTopBids().call();
                this.topBids = allBids.filter((bid) => bid.bid != "0");
                this.newBid = { ...EMPTY_BID };
                this.message = {show: false, type: '', text: ''};
            }).catch(err => {
                console.log(err);
                this.message = {show: true, type: 'error', text: 'Oops! Something went wrong'};
            })
            this.message = {show: true, type: 'success', text: 'Processing bid and syncing to blockchain. Please be patient.'};
        },
        async init() {
            [web3, Kob] = await init();
            this.isConnected = await isConnected();
            if (this.isConnected) {
                const allBids = await Kob.methods.getTopBids().call();
                this.topBids = allBids.filter((bid) => bid.bid != "0");
                this.maxBid = await Kob.methods.maxBid().call();
                this.charities = await Kob.methods.getCharities().call();
            } else {
                console.error("Could not connect to blockchain network. Please ensure you selected the correct one in your wallet")
            }

        },
    }))
})