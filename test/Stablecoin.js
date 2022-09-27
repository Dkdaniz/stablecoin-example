const chai = require('chai');

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require('hardhat');
const { expect } = chai;

const getSigners = async () => {
  const [owner, addr1, addr2] = await ethers.getSigners();
  return { owner, addr1, addr2 }; 
}

async function deployStablecoin() {
  const { owner, addr1, addr2 } = await  getSigners()

  const Stablecoin = await ethers.getContractFactory("Stablecoin");
  const stablecoin = await Stablecoin.deploy();

  await stablecoin.deployed();

  return { Stablecoin, stablecoin, owner, addr1, addr2 };
}

describe('Stablecoin', function() {
  describe('Decimals', function() {
    it("Should returns decimals equal 4", async () => {
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

  describe('Redeem', async () => {
    it("Should returns error role access",  async () => {
      const { stablecoin, addr1, } = await loadFixture(deployStablecoin);

      await expect(stablecoin.connect(addr1).redeem(1)).to.be.revertedWith(/AccessControl: account .* is missing role .*/)
    });

    it("Should returns error when amount exceeds total supply",  async () => {
      const { stablecoin, owner, } = await loadFixture(deployStablecoin);
      await expect(stablecoin.connect(owner).redeem(ethers.utils.parseUnits('10', 'ether'))).to.be.revertedWith("ERC20: redeem amount exceeds total supply")
    });

    context('Trying redeem to token', async () => {
      before(async () => {
        const { stablecoin, owner, addr1 } = await loadFixture(deployStablecoin);

        await stablecoin.connect(owner).mint(addr1.address, ethers.utils.parseUnits('1', 'ether'));

        this.stablecoin = stablecoin;
      });
    
      it("Should returns error when amount exceeds balance",  async () => {
        const { owner } = await getSigners()
        await expect(this.stablecoin.connect(owner).redeem(ethers.utils.parseUnits('1', 'ether'))).to.be.revertedWith("ERC20: redeem amount exceeds balance")
      });

      it("Should returns balance of 1 ether to owner after the transfer function is invoked by the addr1 wallet",  async () => {
        const { owner, addr1 } = await getSigners()

        await this.stablecoin.connect(addr1).transfer(owner.address, ethers.utils.parseUnits('1', 'ether'));
        expect(await this.stablecoin.connect(owner).balanceOf(owner.address)).to.equal(ethers.utils.parseUnits('1', 'ether'));
      });

      it("Should returns balance of 0 ether after the redeem function is invoked",  async () => {
        const { owner } = await getSigners()

        await (this.stablecoin.connect(owner).redeem(ethers.utils.parseUnits('1', 'ether')))
        expect(await this.stablecoin.connect(owner).balanceOf(owner.address)).to.equal(ethers.utils.parseUnits('0', 'ether'));
      });

      it("Should returns totalSupply of 0 eth",  async () => {
        const { owner } = await getSigners()

        expect(await this.stablecoin.connect(owner).totalSupply()).to.equal(ethers.utils.parseUnits('0', 'ether'));
      });
    })
  })

  describe('getBlackListStatus', async() => {
    it("Should returns account block is false",  async () => {
      const { stablecoin, owner } = await loadFixture(deployStablecoin);

      expect(await stablecoin.connect(owner).getBlackListStatus(owner.address)).to.equal(false);
    });
  })

  describe('AddBlackList', function() {
    it("Should returns error role access",  async () => {
      const { stablecoin, owner, addr1, } = await loadFixture(deployStablecoin);

      await expect(stablecoin.connect(addr1).addBlackList(owner.address)).to.be.revertedWith(/AccessControl: account .* is missing role .*/)
    });

    context('Trying add addr1 into blacklist', async () => {
      before(async () => {
        const { stablecoin } = await loadFixture(deployStablecoin);
        this.stablecoin = stablecoin;
      });

      it("Should returns account addr1 block is true",  async () => {
        const { owner, addr1 } = await getSigners()
  
        await this.stablecoin.connect(owner).addBlackList(addr1.address);
        expect(await this.stablecoin.connect(owner).getBlackListStatus(addr1.address)).to.equal(true);
      });
    })
  }) 

  describe('removeBlackList', function() {
    it("Should returns error role access",  async () => {
      const { stablecoin, owner, addr1, } = await loadFixture(deployStablecoin);

      await expect(stablecoin.connect(addr1).removeBlackList(owner.address)).to.be.revertedWith(/AccessControl: account .* is missing role .*/)
    });

    context('Trying remove addr1 into blacklist', async () => {
      before(async () => {
        const { stablecoin, owner, addr1} = await loadFixture(deployStablecoin);

        await stablecoin.connect(owner).addBlackList(addr1.address);

        this.stablecoin = stablecoin;
      });

      it("Should returns account addr1 block is false",  async () => {
        const { owner, addr1 } = await getSigners()
        
        expect(await this.stablecoin.connect(owner).getBlackListStatus(addr1.address)).to.equal(true);

        await this.stablecoin.connect(owner).removeBlackList(addr1.address);

        expect(await this.stablecoin.connect(owner).getBlackListStatus(addr1.address)).to.equal(false);
      });
    })
  }) 

  describe('destroyBlackFunds', function() {
    it("Should returns error role access",  async () => {
      const { stablecoin, owner, addr1, } = await loadFixture(deployStablecoin);

      await expect(stablecoin.connect(addr1).destroyBlackFunds(owner.address)).to.be.revertedWith(/AccessControl: account .* is missing role .*/)
    });

    it("Should returns error user dont is in blacklist",  async () => {
      const { stablecoin, owner, addr1, } = await loadFixture(deployStablecoin);

      await expect(stablecoin.connect(owner).destroyBlackFunds(addr1.address)).to.be.revertedWith("Stablecoin: user dont is in blacklist")
    });

    context('Trying destroy funds of addr1', async () => {
      before(async () => {
        const { stablecoin, owner, addr1} = await loadFixture(deployStablecoin);

        await stablecoin.connect(owner).mint(addr1.address, ethers.utils.parseUnits('1', 'ether'));
        await stablecoin.connect(owner).addBlackList(addr1.address);

        this.stablecoin = stablecoin;
      });

      it("Should returns balance wallet is zero",  async () => {
        const { owner, addr1 } = await getSigners()

        const oldTotalSupply = await this.stablecoin.connect(owner).totalSupply();
        const balance = await this.stablecoin.connect(owner).balanceOf(addr1.address);
        const newTotalSupply = oldTotalSupply - balance;

        await this.stablecoin.connect(owner).destroyBlackFunds(addr1.address);

        expect(await this.stablecoin.connect(owner).balanceOf(addr1.address)).to.equal(ethers.utils.parseUnits('0', 'ether'));
        expect(await this.stablecoin.connect(owner).totalSupply()).to.equal(newTotalSupply);
      });
    })
  }) 
});
