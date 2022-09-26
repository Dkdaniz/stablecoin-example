const chai = require('chai');

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require('hardhat');
const { expect } = chai;

const getAccounts = async () => {
  const accounts = await ethers.getSigners();
  return accounts;
};

async function deployStablecoin() {
  const Stablecoin = await ethers.getContractFactory("Stablecoin");
  const [owner, addr1, addr2] = await ethers.getSigners();

  const stablecoin = await Stablecoin.deploy();

  await stablecoin.deployed();

  return { Stablecoin, stablecoin, owner, addr1, addr2 };
}

describe('Stablecoin', function() {
  describe('Decimals', function() {
    it("Should returns decimals equal 4", async function () {
      const { stablecoin } = await loadFixture(deployStablecoin);
      const decimals = await stablecoin.decimals();
      expect(decimals).to.equal(4);
    });
  })

  describe('Pause', function() {
    it("Should returns error role access",  async () => {
      const { stablecoin, addr1, } = await loadFixture(deployStablecoin);

      await expect(stablecoin.connect(addr1).pause()).to.be.revertedWith(/AccessControl: account .* is missing role .*/)
    });

    it("Should returns pause status equal true",  async () => {
      const { stablecoin, owner, } = await loadFixture(deployStablecoin);

      await stablecoin.connect(owner).pause();

      expect(await stablecoin.connect(owner).paused()).to.equal(true);
    });
  })

  describe('Unpause', function() {
    it("Should returns error role access",  async () => {
      const { stablecoin, addr1, } = await loadFixture(deployStablecoin);

      await expect(stablecoin.connect(addr1).unpause()).to.be.revertedWith(/AccessControl: account .* is missing role .*/)
    });

    it("Should returns error not paused",  async () => {
      const { stablecoin, owner, } = await loadFixture(deployStablecoin);

      await expect(stablecoin.connect(owner).unpause()).to.be.revertedWith("Pausable: not paused")
    });

    it("Should returns pause status equal false",  async () => {
      const { stablecoin, owner, } = await loadFixture(deployStablecoin);

      await stablecoin.connect(owner).pause();
      await stablecoin.connect(owner).unpause();

      expect(await stablecoin.connect(owner).paused()).to.equal(false);
    });
  })

  describe('Mint', function() {
    it("Should returns error role access",  async () => {
      const { stablecoin, addr1, } = await loadFixture(deployStablecoin);

      await expect(stablecoin.connect(addr1).mint(addr1.address, 1)).to.be.revertedWith(/AccessControl: account .* is missing role .*/)
    });

    it("Should returns pause status equal true",  async () => {
      const { stablecoin, owner, addr1 } = await loadFixture(deployStablecoin);

      await stablecoin.connect(owner).mint(addr1.address, ethers.utils.parseUnits('10', 'ether'));

      expect(await stablecoin.connect(addr1).balanceOf(addr1.address)).to.equal(ethers.utils.parseUnits('10', 'ether'));
    });
  })

  
});
