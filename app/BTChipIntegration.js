/*
************************************************************************
Copyright (c) 2014 UBINITY SAS

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*************************************************************************
*/

var cardFactory = new ChromeapiPlugupCardTerminalFactory();

function getCard() {
	console.log("getCard");
	try {
	return cardFactory.list_async().then(function(result) {
		console.log("result getCard");
		console.log(result);
		if (result.length == 0) {
			return;
		}
		else {
			return cardFactory.getCardTerminal(result[0]).getCard_async();
		}
	});
	}
	catch(e) {
		console.log("getCard fail");
		console.log(e);
	}
}

function ajax_async(url, data) {
	var deferred = Q.defer();
    console.log("ajax " + url);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
        	console.log("xhr result " + xhr.responseText);
			deferred.resolve(xhr.responseText);        	
            xhr.close;
        }
    }
    xhr.open(data ? "POST" : "GET", url, true);
    if (data) xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    return deferred.promise;
}

function getUnspentForDongle(address, internalAddress, minConfirm) {
	  var resultData = {};
	  resultData['address'] = address;
	  resultData['unspent'] = [];
	  if (typeof minConfirm == "undefined") {
	  	minConfirm = 5;
	  }
      // get unspent output and balance at once
      // http://blockchain.info/unspent?active=<address>
      return ajax_async('http://blockchain.info/unspent?active=' + address)
      .then(function (result) {        
        try {
          result = JSON.parse(result);
        }
        catch(e) {
          // Nothing to spend
          return resultData;
        }
        // if another pending request, then abort the current one
        if (1 == 1) {
          /* result sample
          {
            "unspent_outputs":[
                    {
                            "tx_hash":"23fe73e63852485db3ea7f0c5777999a8e7462aa6cb2cfcedbaefa3a2365248b",
                            "tx_index":69244573,
                            "tx_output_n": 7,       
                            "script":"76a91409cc4c3c26f9498fe222c78d7efb4193434dae5388ac",
                            "value": 2400,
                            "value_hex": "0960",
                            "confirmations":52991
                    },
                    { 
                      ...
                    },
                    ... ]
           }
           */
          // compute list of transaction index to check
          //transactionIndexedOutputs = [];
          /*
          balance = 0;
          for (var i=0; i < result['unspent_outputs'].length; i++) {
            // skip output without enough confirmations
            if (result['unspent_outputs'][i]['confirmations'] < minConfirm) {
              continue;
            }
              
            // compute balance
            balance += result['unspent_outputs'][i]['value'];
          }

          balance = parseFloat(balance, 10)/100000000;
          */
      
          // only proceed to deep unspent inspection if the cached walletbalance is different
          if (1 == 1) {
            
            // update balance
            //('#txBalance').val(balance + ' [still processing]' );
            
            var deferred = Q.defer();
            
            // compute trusted inputs 
            async.each(
              result['unspent_outputs'],
              function (unspent, finishedCallback) {
                // skip output without enough confirmations
                if (unspent['confirmations'] < minConfirm) {
                  finishedCallback();
                  return;
                }
                
                // append an entry for the associated keysets (it's always the same source address as we don't support multiple sources in
                // this basic web client
                //associatedKeySets.push([lastTxHDAccount, lastTxHDIndex, lastTxHDChain]); // order does not matter as it's all the same value
                
                // store the output index
                // https://blockchain.info/rawtx/<tx_index>?format=hex
                ajax_async('http://blockchain.info/rawtx/'+unspent['tx_index']+'?format=hex')
                .then(function (rawtx) {
                  // append the raw transaction that generated each unspent output (for later selection)
				  var transactionElement = {};
				  transactionElement['rawtx'] = rawtx;
				  transactionElement['index'] = unspent['tx_output_n'];
				  transactionElement['value'] = unspent['value_hex'];                  
          transactionElement['internalAddress'] = internalAddress;
				  resultData['unspent'].push(transactionElement);
				  finishedCallback();
                  //unspent['rawtx'] = rawtx;
                  //var splittx = bitcoin.splitTransaction(rawtx);
                  //console.log(splittx);
                });
              },
              function (enderr) {
                if ((typeof enderr != "undefined") && (enderr != null)) {
                  deferred.reject(enderr);
                }
                // if another pending request, then abort the current one
                if (1 == 1) { 
                  // update balance
                  //$('#txBalance').val(balance);
                
                  // backup data for upcoming transaction (don't overload card if the address is to be updated)
                  //walletBalance[publicAddress] = balance;
                  // store unspent output to process their selection upon payment
                  //walletUnspentOutputs[publicAddress] = result['unspent_outputs'];
                  //deferred.resolve(undefined);
                  deferred.resolve(resultData);
                }
                else {
                  deferred.reject("Another address is being processed");
                }
              }
            );
            
            return deferred.promise
            .fail(function (err) {
              console.log(err);
              throw _e(err, "Can't process unspent outputs for that address");
            });
          }
        }
      })
      .fail(function (err) {
        console.log(err);
        throw _e(err, "Can't retrieve balance for that address");
      });      
}

function pickUnspent(resultUnspent, desiredAmount) {
  var chosenTransactions = [];
  // Sort all transactions by smallest value
  var resultUnspentSorted = resultUnspent.sort(function(item1, item2) {
    var value1 = new BigInteger(item1['value'], 16);
    var value2 = new BigInteger(item2['value'], 16);
    return value1.compareTo(value2);
  });
  // Pick transactions until the amount is found
  var cumulatedValue = BigInteger.ZERO;
  for (var i=0; i<resultUnspentSorted.length; i++) {
    chosenTransactions.push(resultUnspentSorted[i]);
    cumulatedValue = cumulatedValue.add(new BigInteger(resultUnspentSorted[i]['value'], 16));
    if (cumulatedValue.compareTo(desiredAmount) >= 0) {
      break;
    } 
  }
  return chosenTransactions;
}

function parseBitcoinValue(valueString) {
    // TODO: Detect other number formats (e.g. comma as decimal separator)
    var valueComp = valueString.split('.');
    var integralPart = valueComp[0];
    var fractionalPart = valueComp[1] || "0";
    while (fractionalPart.length < 8) fractionalPart += "0";
    fractionalPart = fractionalPart.replace(/^0+/g, '');
    var value = BigInteger.valueOf(parseInt(integralPart));
    value = value.multiply(BigInteger.valueOf(100000000));
    value = value.add(BigInteger.valueOf(parseInt(fractionalPart)));
    var valueString = value.toString(16);
    while (valueString.length < 16) {
    	valueString = "0" + valueString;
    }
    return new ByteString(valueString, HEX);
  }
