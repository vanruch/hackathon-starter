// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IFeeStrategy {
    function managerFeeRate() external view returns (uint256);
}

interface IProtocolConfig {
    function protocolFeeRate() external view returns (uint256);
}

interface IFlexiblePortfolio {
    function name() external view returns(string memory);
    function totalAssets() external view returns(uint256);
    function virtualTokenBalance() external view returns(uint256);
    function liquidAssets() external view returns(uint256);
    function feeStrategy() external view returns(IFeeStrategy);
    function protocolConfig() external view returns(IProtocolConfig);
}

struct ReturnStruct {
        string name;
        uint256 totalAssets;
        uint256 virtualTokenBalance;
        uint256 liquidAssets;
        IProtocolConfig pc;
        uint256 protocolFeeRate;
        IFeeStrategy fs;
        uint256 managerFeeRate;
}

contract FlexiblePortfolioGetter {
    function getPortfolios(IFlexiblePortfolio[] calldata fpAddressess) public view returns(ReturnStruct[] memory){
        ReturnStruct[] memory returnArray = new ReturnStruct[](fpAddressess.length);
        for (uint256 i = 0; i < fpAddressess.length; i++) {
              if(address(fpAddressess[i]).code.length == 0) continue;
              IFlexiblePortfolio fp = fpAddressess[i];
              string memory name = fp.name();
              uint256 totalAssets = fp.totalAssets();
              uint256 virtualTokenBalance = fp.virtualTokenBalance();
              uint256 liquidAssets = fp.liquidAssets();
              IProtocolConfig pc = fp.protocolConfig();
              uint256 protocolFeeRate = pc.protocolFeeRate();
              IFeeStrategy fs = fp.feeStrategy();
              uint256 managerFeeRate = fs.managerFeeRate();
              ReturnStruct memory a = ReturnStruct(name, totalAssets, virtualTokenBalance, liquidAssets, pc, protocolFeeRate, fs, managerFeeRate);
              returnArray[i] = a;
        }
        return returnArray;
    }
}
