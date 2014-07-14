function setMsg(str)
{
  $("#errorBox").show().html(str);
}

function setSettingsMsg(str)
{
  $("#settingsErrorBox").show().html(str);
}

function setGPGMsg(str)
{
  str = (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br/>$2');
  $("#gpgErrorBox").show().html(str);
}




var unique = function (origArr)
{
    var dict = {},
    newArr = []
    for (var i = 0; i < origArr.length; i++) {
        if (!dict[origArr[i]]) {
            newArr.push(origArr[i])
            dict[origArr[i]] = true
        }
    }
    return newArr;
};

chrome.extension.onRequest.addListener(function (object)
{

  var addresses = object.addresses;


  if (object.msgCount)
  {
    $("#msgCount").html("(" + object.msgCount + ")");
  }

  if (addresses)
  {
    
    var cleanAddresses = Array();

    for (var index in addresses)
    {
      str = addresses[index];

      removeChars = "<>&:?\".()|' \n;";

      for (var c in removeChars)
          str = str.replace(removeChars[c],'')

      cleanAddresses.push(str);
    }

    cleanAddresses = unique(cleanAddresses);

    cleanAddresses.sort();

    var addressCount = 0;

    
    uris = object.uris;

    var usedUris = [];

    for ( var index in uris )
    {

      if ( usedUris.indexOf( uris[index].address ) > -1 )
      {
        break;
      }

      usedUris.push( uris[index].address );

      if ( rush.checkAddress( uris[index].address ) )
      {
        $("#addresses").prepend("<div class='address' amount='" + uris[index].amount + "' address='" + uris[index].address + "'><span class='addressTxt'>" + uris[index].address + "</span> <b>(฿" + uris[index].amount + ")</b></div>");   
        addressCount++;     
      }

      if ( cleanAddresses.indexOf( uris[index].address ) > -1  )
      {
        cleanAddresses.splice( cleanAddresses.indexOf( uris[index].address ), 1 );
      }
    }


    for (var index in cleanAddresses)
    {
      str = cleanAddresses[index];

      if ( rush.checkAddress( str ) )
      {
        $("#addresses").append("<div class='address' address='" + str + "'><span class='addressTxt'>" + str + "</span></div>");   
        addressCount++;     
      }
    }

    

    if ( addressCount )
    {
      $("#addresses").show().css(
      {
        "border-bottom": "1px solid #DDD"
      });

      $("#foundTitle").show();
    }
  }


});




window.onload = function ()
{

  console.log("ONLOAD");
 
  //document.getElementById('resetAddress').onclick = rush.prepareReset;

  $(document).on("click", '#send', function (event)
  {
    rush.send();
  });

  $(document).on("click", '#confirmReset', function (event)
  {
    rush.reset();
  });

  $(document).on("click", '#showSettings', function (event)
  {
    rush.showSettings();
  });

  $(document).on("click", '#gpgShowSettings', function (event)
  {
    rush.gpgShowSettings();
  });

  $(document).on("click", '#preparePassword', function (event)
  {
    rush.preparePassword();
  });

  $(document).on("click", '#setPasswordBtn', function (event)
  {
    rush.setPassword();
  });

  $(document).on("click", '#noReset', function (event)
  {
    $("#errorBox").hide();
  });

  $(document).on("click", '#export', function (event)
  {
    rush.exportWallet();
  });

  $(document).on("click", '#import', function (event)
  {
    rush.importWallet();
  });

  $(document).on("click", '#qrLink', function (event)
  {
    if ($(this).html() == '<img src="qr.png" id="qr">')
    {
      $("#address").html("<img id='qrImage' src='https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=bitcoin%3A" + rush.address + "&chld=H|0'>");
      $(this).html("[Close QR]");
    }
    else
    {
      $("#address").html(rush.address);
      $(this).html('<img src="qr.png" id="qr">');
    }
  });

  $(document).on("click", '#txHistory', function (event)
  {
    chrome.tabs.create(
    {
      url: "https://blockchain.info/address/" + rush.address
    });
  });

  $(document).on("click", '.donateSiteLink', function (event)
  {
    chrome.tabs.create(
    {
      url: $(this).attr("link")
    });
  });

  $(document).on("click", '.address', function (event)
  {
    $("#txtAddress").val($(this).attr("address"));

    if ( $(this).attr("amount") )
    {
      $("#txtAmount").val( $(this).attr("amount") );
      rush.amountFiatValue( $(this).attr("amount") );
    }      

  });

  $(document).on("click", '#confirmImport', function (event)
  {
    rush.confirmImport();
  });

  $(document).on("click", '#performSetup', function (event)
  {
    rush.performSetup();
  });

  $(document).on("click", '#gpgCreate', function (event)
  {
    rush.gpgCreate();
  });

  $(document).on("click", '#gpgBox', function (event)
  {
    this.select();
  });

  $(document).on("click", '#gpgCreate2', function (event)
  {
    rush.gpgCreate();
  });

  $(document).on("click", '#shareKey', function (event)
  {
    chrome.tabs.create({ url: $(this).attr("share") });
  });

  $(document).on("click", '#contact', function (event)
  {
    chrome.tabs.create({ url: "mailto:support@kryptokit.com" });
  });

  $(document).on("click", '#confirmGPGCreate', function (event)
  {
    if ($("#confirmGPGCreate").attr("confirmed"))
    {
      $("#confirmGPGCreate").html("Generating...").attr("disabled", "disabled");

      $("#clearBox").hide();

      setTimeout( function () { rush.confirmGPGCreate(); }, 100 );
    }
    else
    {
      rush.confirmGPGCreate();
    }

  });

  $(document).on("click", '#gpgImport', function (event)
  {
    rush.gpgImport();
  });

  $(document).on("click", '#confirmGPGImport', function (event)
  {
    rush.confirmGPGImport();
  });

  $(document).on("click", '#gpgEncrypt', function (event)
  {
    rush.gpgEncrypt();
  });

  $(document).on("click", '#gpgSendEncrypted', function (event)
  {
    rush.gpgSendEncrypted();
  });

  $(document).on("click", '#gpgConfirmSendEncrypted', function (event)
  {
    rush.gpgConfirmSendEncrypted();
  });

  $(document).on("click", '#gpgConfirmEncrypt', function (event)
  {
    rush.gpgConfirmEncrypt();
  });

  $(document).on("click", '#gpgDecrypt', function (event)
  {
    rush.gpgDecrypt();
  });

  $(document).on("click", '#gpgConfirmDecrypt', function (event)
  {
    rush.gpgConfirmDecrypt();
  });

  $(document).on("click", '#gpgGetMessages', function (event)
  {
    rush.gpgGetMessages();
  });

  $(document).on("click", '#gpgVerifyGetMessages', function (event)
  {
    rush.gpgVerifyGetMessages($(this).attr("secret"));
  });


  $(document).on("click", '#gpgManage', function (event)
  {
    rush.gpgManage();
  });

  $(document).on("click", '#gpgDelete', function (event)
  {
    rush.gpgDelete();
  });

  $(document).on("click", '#msgRead', function (event)
  {
    rush.msgRead();
  });

  $(document).on("click", '#msgReply', function (event)
  {
    rush.msgReply( $(this).attr("msgID") );
  });

  $(document).on("click", '#msgDel', function (event)
  {
    rush.msgDel();
  });


  $(document).on("click", '#gpgExport', function (event)
  {
    rush.gpgExport();
  });

  $(document).on("click", '#setCurrency', function (event)
  {
    rush.setCurrency();
  }); 

  $(document).on("click", '#setNews', function (event)
  {
    rush.setNews();
  });

  $(document).on("click", '#backup', function (event)
  {
    rush.backup();
  });

  $(document).on("click", '#restore', function (event)
  {
    rush.prepareRestore();
  });

  $(document).on("click", '#help', function (event)
  {
    rush.help();
  });

  $(document).on("click", '#userManual', function (event)
  {
    rush.userManual();
  });

  $(document).on("click", '#gpgExportPrivate', function (event)
  {
    rush.gpgExportPrivate();
  });

  $(document).on("click", '#gpgImportPrivate', function (event)
  {
    rush.gpgImportPrivate();
  });

  $(document).on("click", '#gpgConfirmImportPrivate', function (event)
  {
    rush.gpgConfirmImportPrivate();
  });

  $(document).on("change", '#gpgSavePassword', function (event)
  {
    rush.gpgSavePassword();
  });

  $(document).on("change", '#currencies', function (event)
  {
    rush.setCurrencyConfirm();
  });

  $(document).on("change", '#newsType', function (event)
  {
    rush.setNewsConfirm();
  });

  $(document).on("click", '#gpgExportPublic', function (event)
  {
    rush.gpgExportPublic();
  });

  $(document).on("click", '#removePassword', function (event)
  {
    rush.removePassword();
  });

  $(document).on("dblclick", '#messageList', function (event)
  {
    rush.msgRead();
  });
  
  $(document).on("dblclick", '.address', function (event)
  {
    chrome.tabs.create({
      'url': "https://blockchain.info/address/" + $(this).attr("address") }, function(tab) {
      });
  });

  $(document).on("click", '.newsItem', function (event)
  {
    chrome.tabs.create({
      'url': $(this).attr("link") }, function(tab) {
      });
  });

  $(document).on("click", '.newsItemReddit', function (event)
  {
    chrome.tabs.create({
      'url': "http://reddit.com" + $(this).attr("link") }, function(tab) {
      });
  });

  $(document).on("click", '#confirmRemovePassword', function (event)
  {
    rush.confirmRemovePassword();
  });

  $(document).on("click", '#restoreConfirm', function (event)
  {
    rush.restore();
  });

  $(document).on("click", '#clearBox', function (event)
  {
    $("#errorBox").hide();
    $("#gpgErrorBox").hide();
  });

 $(document).on("click", '#clearContactDel', function (event)
  {
    $(this).hide();
    $("#contactDel").html("Delete").removeAttr("confirmed");
  });

  $(document).on("click", '#settings', function (event)
  {
    rush.openTab("settings");
  });  

  $(document).on("click", '#donate', function (event)
  {
    rush.loadDonateOptions();
  });

  $(document).on("click", '#directoryTab', function (event)
  {
    rush.openDirectoryTab();
  });

  $(document).on("click", '.categoryItem', function (event)
  {
    rush.showCompanies( $(this).attr("idcategory") );
  }); 

  $(document).on("click", '#backBtn', function (event)
  {
    rush.openDirectoryTab();
  }); 

  $(document).on("click", '.companyItem', function (event)
  {
    idcompany = $(this).attr("idcompany");

    chrome.tabs.create({
      'url': "http://" + rush.directory.company[idcompany].site }, function(tab) {
      });
  });

  $(document).on("click", '#contactAdd, #contactSentAdd', function (event)
  {
    rush.contactAdd( $(this).attr("address") );
  });
  
  $(document).on("click", '#contactDel', function (event)
  {
    rush.contactDel();
  });

  $(document).on("click", '#contactSelect', function (event)
  {
    rush.contactSelect();
  });

  $(document).on("dblclick", '#contactsList', function (event)
  {
    rush.contactSelect();
  });

  $(document).on("click", '#confirmContactAdd', function (event)
  {
    rush.confirmContactAdd();
  });

  $(document).on("click", '.donateLink', function (event)
  {
    rush.prepareDonate( $(this).attr("donateID") );
  });  

  $(document).on("click", '.donateNow', function (event)
  {
    rush.donate( this );
  }); 

  $(document).on("click", '#contactIcon', function (event)
  {
    if ( $( "#contacts" ).css("display") == "block" )
    {
      $( "#contacts, #contactsTitle" ).hide();
    }
    else
    {
      rush.displayContacts();      
    }
  });

  $(document).on("click", '#gpgTab', function (event)
  {
    rush.openGpgTab();
  });

  $(document).on("click", '.address', function (event)
  {
    $(".address").removeClass("selectedAddress");
    $(this).addClass("selectedAddress");
  });

  $(document).on("click", '#walletTab', function (event)
  {
    rush.openWalletTab();
  });

  $(document).on("click", '#newsTab', function (event)
  {
    rush.openNewsTab();
  });  

  $(document).on("click", '#chartsLink', function (event)
  {
    rush.openChartTab();
  }); 

  $(document).on("click", "#pinButton0", function(event) 
  {    
    rush.cardPin += "0";
    $("#pinTyped").html($("#pinTyped").html() + "*");
  });

  $(document).on("click", "#pinButton1", function(event) 
  {    
    rush.cardPin += "1";
    $("#pinTyped").html($("#pinTyped").html() + "*");
  });

  $(document).on("click", "#pinButton2", function(event) 
  {    
    rush.cardPin += "2";
    $("#pinTyped").html($("#pinTyped").html() + "*");
  });

  $(document).on("click", "#pinButton3", function(event) 
  {    
    rush.cardPin += "3";
    $("#pinTyped").html($("#pinTyped").html() + "*");
  });

  $(document).on("click", "#pinButton4", function(event) 
  {    
    rush.cardPin += "4";
    $("#pinTyped").html($("#pinTyped").html() + "*");
  });

  $(document).on("click", "#pinButton5", function(event) 
  {    
    rush.cardPin += "5";
    $("#pinTyped").html($("#pinTyped").html() + "*");
  });

  $(document).on("click", "#pinButton6", function(event) 
  {    
    rush.cardPin += "6";
    $("#pinTyped").html($("#pinTyped").html() + "*");
  });

  $(document).on("click", "#pinButton7", function(event) 
  {    
    rush.cardPin += "7";
    $("#pinTyped").html($("#pinTyped").html() + "*");
  });

  $(document).on("click", "#pinButton8", function(event) 
  {    
    rush.cardPin += "8";
    $("#pinTyped").html($("#pinTyped").html() + "*");
  });

  $(document).on("click", "#pinButton9", function(event) 
  {    
    rush.cardPin += "9";
    $("#pinTyped").html($("#pinTyped").html() + "*");
  });

  $(document).on("click", "#pinErase", function(event) 
  {    
    rush.cardPin = "";
    $("#pinTyped").html("");
  });

  $(document).on("click", "#pinOK", function(event) 
  {    
    rush.submitPin();
  });

  $(document).on("click", "#qwertyKbd", function(event) {
     $("#azertyKbd").attr('checked', false);
  });

  $(document).on("click", "#azertyKbd", function(event) {
     $("#qwertyKbd").attr('checked', false);
  });

  var background = chrome.extension.getBackgroundPage();

  addEventListener("unload", function (event)
  {
    background.saveMsg($("#gpgEncryptTxt").val());
  }, true);




  $(document).on("keypress", '.getMessages', function (e)
  {
    var p = e.keyCode;
    if (p == 13)
    {
      rush.gpgVerifyGetMessages($("#gpgVerifyGetMessages").attr("secret"));
    }
  });

  $(document).on("keyup", '#txtAmount', function (event)
  {
    rush.amountFiatValue($(this).val());
  });

  chrome.windows.getCurrent(function (currentWindow)
  {
    chrome.tabs.query(
      {
        active: true,
        windowId: currentWindow.id
      },
      function (activeTabs)
      {
        chrome.tabs.executeScript(
          activeTabs[0].id,
          {
            file: 'find_addresses.js',
            allFrames: true
          });
      });
  });

  // $( document ).tooltip( 
  //     { 
  //       position: 
  //       {
  //         at: "top+30",
  //         my: "top"
  //       }
  //     }

  // );

/*
  if ((typeof rush.pendingSignature == "undefined") && (rush.address.length == 0)) {
      console.log("Arming");
      setTimeout(function() {
        waitDongle();
      }, 1000);
  }
*/  

};

function showMessages()
{
  return;
}

/*
function triggerDeferredUI() {
  console.log(window);
  setMsg("Check " + rush.needPinpad + " " + rush.nardin + " " + rush.address);
  if (rush.needPinpad) {
    //rush.needPinpad = false;
    rush.openPinpad();
  }
}


setInterval(function ()
{
     triggerDeferredUI();

}, 1000);
*/


// content script integration

var port = chrome.runtime.connect("mgbemnbocfpecccpecgommbeilnainej");

port.onMessage.addListener(function(msg) {
        console.log("Forwarding back to application");
        console.log(msg);
        window.postMessage(msg, "*");
});
//window.addEventListener("load", function(event){
//  pageLoaded();
//}, false)

window.addEventListener("message", function(event) {
  console.log("Got message");
  console.log(event);
  /*
  if (event.source != window)
    return;
  */

  if (event.data['destination'] && (event.data['destination'] == "PUP_EXT")) {
    console.log("Content script received: " + event.data);

    port.postMessage(event.data);
  }
}, false);
