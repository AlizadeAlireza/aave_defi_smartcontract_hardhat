1. Deposit collateral : ETH // WETH
2. Borrow another asset : DAI --> known as a stable coin
3. repay the DAI

### lendingpool

we depoite our ETH and get WETH to make interact

we're going to create getWeth and import into aaveBorrow.

for withdraw we need Abi and contract address for call any contract.

after we compile we have the abi to interact with.

### what is Aave

the way Aave works is they actually have a contract, witch will point us to
the correct contract.

## lending pool contract

### ILendingPoolAddressesProvider

the contract that we're going to doing all the lending with is lending pool contract.

and we need a contract that get lending pool contract address.
the contract is LendingPoolContractAddressProvider.

for getting the contract address we create a function and try to get the address.
we need the address and Abi.
we have the address and we want to get Abi.
also we need to declare the contract compiler version in hardhat.config.js

we have a function that is getLendingPool that returns the address of lendingPool.

### ILendingPool

we have lending pool adderss and for lending pool contract we must get the contract Interface.
