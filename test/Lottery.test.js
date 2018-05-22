const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const providerGanache = ganache.provider();
const web3 = new Web3(providerGanache);

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data: '0x' + bytecode
        })
        .send({
            from: accounts[0],
            gas: '1000000'
        });
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether') //web3 library will take 0.02 ether and return equivalent amount of wei
        });

        //calling getPlayers method to get the addresses of all players
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        //checking addresses and number of elements
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            //if there is an error then assert becomes false and our test fails
            assert(false);
        }
        catch (error) {
            //assert just makes sure error has a value - for truthiness
            assert(error);
        }
    });

    //test pickWinner to make sure only manager can pick winner
    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            //if we get to this line of code - automatically fail test - then catch is called
            assert(false);
        }
        catch (error) {
            assert(error);
        }
    });

    //End to end test - runs from top to bottom
    it('sends money to winner and resets the players array', async () => {
        //only entering one winner - to make writing test easier otherwise has to deal with random
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        //get initial balance for account[0]
        //getBalance can used to get balance of external accounts and contract accounts - Units = in wei
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        //finalBalance and initialBalance should be less than 2 - since we have to pay for gas
        const difference = finalBalance - initialBalance;

        //to find how much spend on gas
        // console.log(finalBalance - initialBalance);

        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });

    //can add 2 more test - one to make sure players array gets emptied out after winner is picked - to make sure contract reset
    //another test - make sure lottery balance is 0 - meaning all the money has been passed to the winner
});