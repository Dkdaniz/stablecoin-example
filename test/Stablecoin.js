const chai = require('chai');
const { ethers } = require('hardhat');
const { expect } = chai;


const getAccounts = async () => {
  const accounts = await ethers.getSigners();
  return accounts;
};

const getInstanceContract = async signer => {
  const Stablecoin = await ethers.getContractFactory('Stablecoin', signer);
  const stablecoin = await Stablecoin.deploy();
  return stablecoin;
};

describe('Stablecoin', function() {
  beforeEach(async function() {
    this.accounts = await getAccounts();
    this.contract = await getInstanceContract(this.accounts[0]);
  });

  describe('Deploy', function() {
    it('should return decimals', async function() {
      const decimals = await this.contract.decimals();

      expect(decimals).to.be.equal(4);
    });
  });

  
});
