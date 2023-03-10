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

    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        deployer
    )

    const daiPrice = await getDaiPrice()
    const amountDaiToBorrow =
        availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber()) // we want to just borrow 95%
    console.log(`You can borrow ${amountDaiToBorrow} DAI`)
    // we need this unit for our work
    const amountDaiToBorrowWei = ethers.utils.parseEther(
        amountDaiToBorrow.toString()
    )
    // Borrow
    // how much we have borrow, how much we have in collateral, how much we can borrow!!
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    )
    await getBorrowUserData(lendingPool, deployer)
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer)
}

// MAIN MAIN MAIN MAIN MIAN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN MAIN

async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.address, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("repaid!")
}

async function borrowDai(
    daiAddress,
    lendingPool,
    amountDaiToBorrowWei,
    account
) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrowWei,
        1, // is stable
        0,
        account
    )
    await borrowTx.wait(1)
    console.log("You've borrowed!")
}

async function getDaiPrice() {
    // reading don't need assigner but sending need
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    // we just want answer that is the 1 index of function
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
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
    erc20Address, // for contract
    spenderAddress, // for function in contract
    amountToSpend, // for function in contract
    account // for contract
) {
    // create erc20 contract
    const erc20Token = await ethers.getContractAt(
        "IERC20", // abi
        erc20Address, // contract address
        account // account address
    )
    // approve the contract and wait one block to sure be confirmed
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved")
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`)
    console.log(`You have ${totalDebtETH} worth of ETH Borrowed.`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH .`)
    return { availableBorrowsETH, totalDebtETH }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
