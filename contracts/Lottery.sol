pragma solidity ^0.4.23;

contract Lottery {
    address public manager;
    address[] public players;

    constructor() public {
        manager = msg.sender;
    }

    //payable to send ether
    function enter() public payable {
    //Adding a rule - to make sure players are entering amount of ether to take part in Lottery
    //Require used for validation - if expression evaluates to false - rest of the function doesn't execute
    //msg.value - is in wei -- .01 ether will automatically be converted into wei
        require(msg.value > .01 ether);

        players.push(msg.sender);
    }

    //creating pseudo random number generator - solidity doesn't have a random generator
    function random() private view returns (uint) {
        //sha3 - global statement - don't need to import import
        //keccak256 and sha3 = same thing
        //block = global variable - no need for import
        //takes hexadecimal value and cast it to uint
        return uint(sha3(block.difficulty, now, players));
    }

    //Pick winner function that should only be used by manager
    function pickWinner() public restricted{
        //Using require() to make sure only managers can call pickWinner
        // require(msg.sender == manager);
        //removed require - because restricted will reduce amount of code that we have to write

        uint index = random() % players.length;

        // players[index]; //players[index] - gives address - can use transfer method of address to transfer wei to particular address
        players[index].transfer(this.balance); //this is reference to current contract and balance is all the money that the contract has

        //Reset players array - creates new dynamic address array with initial size of 0
        players = new address[](0);
    }

    //function modifier - to make sure we do not repeat require statement -
    //name of the modifier can be anything
    modifier restricted() {
        require(msg.sender == manager);
        _; //_ = like a target take out all the code whereever you call the modifier function and paste it after require statement
    }

    //function to get all the players inside the array
    function getPlayers() public view returns (address[]) {
        return players;
    }
}