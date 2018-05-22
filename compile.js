const path = require('path');
const fs = require('fs');
const solc = require('solc');

const nameOfFile = 'Lottery.sol';
const contractName = ':Lottery';

const lotteryPath = path.resolve(__dirname, 'contracts', nameOfFile);
const source = fs.readFileSync(lotteryPath, 'utf8');

// module.exports = solc.compile(source, 1); //1 is number of different contracts we are attempting to compile

module.exports = solc.compile(source, 1).contracts[contractName]; //changed the course to only use required data
//The colon before Inbox is for specifying filename if there were multiple contracts. At the moment we used source directly because there is only one file.