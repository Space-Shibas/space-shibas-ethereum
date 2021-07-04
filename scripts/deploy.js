const hre = require("hardhat");

async function main() {
  const SpaceShibas = await hre.ethers.getContractFactory("SpaceShibas");
  const spaceShibas = await SpaceShibas.deploy("Space Shibas", "SPACE-SHIBAS");

  await spaceShibas.deployed();

  console.log("SpaceShibas deployed to:", spaceShibas.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
