const hre = require("hardhat");

async function main() {
  const Stablecoin = await hre.ethers.getContractFactory("Stablecoin");
  const stablecoin = await Stablecoin.deploy();

  await stablecoin.deployed();

  console.log(`deployed to ${stablecoin.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
