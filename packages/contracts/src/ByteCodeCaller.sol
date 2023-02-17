// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract ByteCodeCaller {
    function executeBytecode(bytes memory _data, bytes memory callData) public returns (bytes memory returnData) {
    address pointer;
    assembly { 
        pointer := create(0, add(_data, 32), mload(_data)) 
        }
    (, returnData) = pointer.call(callData);
    }
}