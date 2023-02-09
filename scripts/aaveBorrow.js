const { getNamedAccounts } = require("hardhat")
const { getWeth, AMOUNT } = require("./getWeth")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()
    // abi, address

    // Lending Pool Address Provider: 0x5E52dEc931FFb32f609681B8438A51c675cc232d
    // lending Pool : going to get from the Lending Pool Address Provider
    const lendingPool = await getLendingPool(deployer)

    console.log(`LendingPool address ${lendingPool.address}`)

    // deposit
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    // approve
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    console.log("Depositing....")
    // asset, amount, onBehalfOf, referralcode = always is zero
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited!")

    // Borrow
}

async function getLendingPool(account) {
    // create the lending pool address contract
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )

    // we get the lending pool address
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    // get the lending pool and return it
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    )
    return lendingPool
}

async function approveErc20(
    erc20Address,
    spenderAddress,
    amountToSpend,
    account
) {
    // create erc20 contract
    const erc20Token = await ethers.getContractAt(
        "IERC20", // abit
        erc20Address, // contract address
        account // account address
    )
    // approve the contract and wait one block to sure be confirmed
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
