"use strict";

var _require = require('ethers/utils/units'),
    formatEther = _require.formatEther,
    parseUnits = _require.parseUnits;

var standardABI = require('./erc20-standard-abi');

var erc20ContractID = require('./eth-erc20-contract-id');

var erc20Decimals = require('./eth-erc20-decimals'); // normalize eth transactions to btc like list


var ethTransactionsToBtc = function ethTransactionsToBtc(transactions, address, isErc20, decimals) {
  var _txs = [];

  if (transactions.length) {
    for (var i = 0; i < transactions.length; i++) {
      var type = void 0;

      if (transactions[i].from === transactions[i].to) {
        type = 'self';
      } else if (transactions[i].from === address.toLowerCase()) {
        type = 'sent';
      } else if (transactions[i].to === address.toLowerCase()) {
        type = 'received';
      }

      var _txObj = {
        type: type,
        height: transactions[i].blockNumber,
        timestamp: transactions[i].timeStamp,
        txid: transactions[i].hash,
        nonce: transactions[i].nonce,
        blockhash: transactions[i].blockHash,
        txindex: transactions[i].transactionIndex,
        src: transactions[i].from,
        address: transactions[i].to,
        amount: transactions[i].value != null ? formatEther(transactions[i].value) : null,
        amountWei: transactions[i].value,
        gas: transactions[i].gas != null ? formatEther(transactions[i].gas) : null,
        gasWei: transactions[i].gas,
        gasPrice: transactions[i].gasPrice != null ? formatEther(transactions[i].gasPrice) : null,
        gasPriceWei: transactions[i].gasPrice,
        cumulativeGasUsed: transactions[i].cumulativeGasUsed != null ? formatEther(transactions[i].cumulativeGasUsed) : null,
        cumulativeGasUsedWei: transactions[i].cumulativeGasUsed,
        gasUsed: transactions[i].gasUsed != null ? formatEther(transactions[i].gasUsed) : null,
        gasUsedWei: transactions[i].gasUsed,
        fee: transactions[i].gasPrice != null && transactions[i].gasUsed != null ? formatEther(Number(transactions[i].gasPrice) * Number(transactions[i].gasUsed)) : null,
        feeWei: Number(transactions[i].gasPrice) * Number(transactions[i].gasUsed),
        input: transactions[i].input,
        contractAddress: transactions[i].contractAddress,
        confirmations: transactions[i].confirmations
      };

      if (isErc20) {
        _txObj.tokenName = transactions[i].tokenName;
        _txObj.tokenSymbol = transactions[i].tokenSymbol;
        _txObj.tokenDecimal = transactions[i].tokenDecimal;
        _txObj.amount = transactions[i].value != null ? formatEther(parseUnits(transactions[i].value, decimals).toString()) : null;
        _txObj.amountWei = transactions[i].value != null ? parseUnits(transactions[i].value, decimals).toString() : null;
      } else {
        _txObj.error = transactions[i].isError;
        _txObj.txreceipt_status = transactions[i].txreceipt_status;
      }

      _txs.push(_txObj);
    }
  }

  var _uniqueTxs = new Array();

  _uniqueTxs = Array.from(new Set(_txs.map(JSON.stringify))).map(JSON.parse);
  return _uniqueTxs;
}; // http://gasstation.info/json/ethgasAPI.json rates are in 10gwei


var ethGasStationRateToWei = function ethGasStationRateToWei(rate) {
  return parseUnits(Number(rate / 10).toString(), 'gwei').toString();
};

var maxSpend = function maxSpend(balance, fee, amount) {
  var _amount = amount > balance ? balance : amount;

  if (Number(_amount) + fee > balance) {
    _amount -= fee;
  }

  return _amount;
};

module.exports = {
  ethTransactionsToBtc: ethTransactionsToBtc,
  ethGasStationRateToWei: ethGasStationRateToWei,
  maxSpend: maxSpend,
  standardABI: standardABI,
  erc20ContractID: erc20ContractID,
  erc20Decimals: erc20Decimals
};