const { ethers } = require("hardhat");

async function main() {
  // 1. Deploy the implementation contract (PropertyNFT) first
  const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
  const implementation = await PropertyNFT.deploy();
  const implementationAddress = implementation.address;

  console.log(
    `✅ PropertyNFT implementation deployed to: ${implementationAddress}`
  );

  // 2. Deploy the factory, passing the implementation's address to the constructor
  const PropertyNFTFactory = await ethers.getContractFactory(
    "PropertyNFTFactory"
  );
  const factory = await PropertyNFTFactory.deploy(implementationAddress);
  const factoryAddress = factory.address;

  console.log(`✅ PropertyNFTFactory deployed to: ${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
