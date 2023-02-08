const { getNamedAccounts } = require("hardhat")
const { getWeth } = require("./getWeth")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()
    // abi, address

    // Lending Pool Address Provider: 0x5E52dEc931FFb32f609681B8438A51c675cc232d
    // lending Pool : going to get from the Lending Pool Address Provider
    const lendingPool = await getLendingPool(deployer)
    console.log(`LendingPool address ${lendingPool.address}`)
}

async function getLendingPool(account) {
    // create the lending pool address contract
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0x5E52dEc931FFb32f609681B8438A51c675cc232d",
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

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
