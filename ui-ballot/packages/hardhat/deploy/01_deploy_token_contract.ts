// First run: yarn add @nomicfoundation/hardhat-viem --dev
import { Contract } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { parseEther, formatEther, toHex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";

const MINT_VALUE = parseEther("5");
const acc1 = "0x81D51adbC06827784cE72184Fce6861FFF31D16C";      //trust
const acc2 = "0xE9A6D4CE4df50DB966ec33Fc86F54581c0D2961E";      //artur
const acc3 = "0xC35c40Bd72F7528893a259dbf40Fcb266002663e";      //marco
const acc4 = "0x0936203E154ed749c099fc585770063fAD30BE35";      //me
const proposalColl = ["Biaggi", "Stoner", "Rossi", "Marquez"];

const deployTokenContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    // Creating publicClient and WalletClient  
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    await deploy("Shebang", {
        from: deployer,
        // Contract constructor arguments
        args: [],
        log: true,
        // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
        // automatically mining the contract deployment transaction. There is no effect on live networks.
        autoMine: true,
    });
    const tokenContract = await hre.ethers.getContract<Contract>("Shebang", deployer);
    console.log("👋 Token name :", await tokenContract.name());
    console.log(`token contract address = ${await tokenContract.getAddress()}`)

    const mintTxAcc1 = await tokenContract.mint(acc1, MINT_VALUE);//Trust
    await mintTxAcc1.wait();
    const mintTxAcc2 = await tokenContract.mint(acc2, MINT_VALUE);//Artur
    await mintTxAcc2.wait();
    const mintTxAcc3 = await tokenContract.mint(acc3, MINT_VALUE);//Marco
    await mintTxAcc3.wait();
    const mintTxAcc4 = await tokenContract.mint(acc4, MINT_VALUE);//Me
    await mintTxAcc4.wait();
    
    // Deploy the TokenizedBallot contract with a block reference after the self delegations
    await deploy("TokenizedBallot",{
        from: deployer,
        args: [
            proposalColl.map((prop) => toHex(prop, { size: 32 })),
            await tokenContract.getAddress(),
            await hre.ethers.provider.getBlockNumber() // Use the current block number as the target block
        ],
        autoMine: true
    });
    const ballotContract = await hre.ethers.getContract<Contract>("TokenizedBallot", deployer);
    console.log("👋 targetBlockNumber :", await ballotContract.targetBlockNumber());
    console.log(`TokenizedBallot contract deployed at ${ballotContract.address}`);
}

export default deployTokenContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployTokenContract.tags = ["TokenContract"];