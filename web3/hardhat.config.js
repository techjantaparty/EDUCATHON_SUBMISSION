require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "aia",
  networks: {
    aia: {
      url: process.env.API_URL,
      chainId: 1320,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
