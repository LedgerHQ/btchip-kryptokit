bg = {

	"msgCount": 0,
	"contextEncrypt":[]
}

///context

function encryptSelection(info, tab) {
  // console.log("item " + info.menuItemId + " was clicked");
  // console.log("info: " + JSON.stringify(info));
  // console.log("tab: " + JSON.stringify(tab));

  // console.log( "Corresponds to user: " + rush.gpgKeys[bg.contextEncrypt[info.menuItemId]].name);

  openpgp.init();

  var encrypted = openpgp.write_encrypted_message(openpgp.read_publicKey(rush.gpgKeys[bg.contextEncrypt[info.menuItemId]].key), info.selectionText);
  jswin = window.open("", "jswin", "width=500,height=500");
  str = encrypted.replace(/\n/g, '<br />');
  jswin.document.write("<span style='font-size:14px;font-family:helvetica, arial;'>"+str+"</span>");
}

setTimeout( function() 
	{
		loadContext();
	}, 500
);

function loadContext ()
{
	if ( rush.gpgKeys.length > 0 )
	{
		var parent = chrome.contextMenus.create({"title": "Encrypt Selection", "contexts":["selection"]});
		for ( i in rush.gpgKeys )
		{
			childid = chrome.contextMenus.create({"title": rush.gpgKeys[i].name, "parentId": parent, "onclick": encryptSelection, "contexts":["selection"]});

			bg.contextEncrypt[childid] = i;

			// console.log(rush.gpgKeys[i].name + " childid: " + childid);
		}
	}
}


//end context

//trusted
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if ( "category" in rush.directory )
    {
    	rush.getPageInfo();
    }
    else
    {
    	rush.loadDirectory(function(){ rush.getPageInfo() });
    }
});

chrome.tabs.onActivated.addListener(function(tabId, changeInfo) {
	if ( "category" in rush.directory )
	{
		rush.getPageInfo();
	}
	else
	{
		rush.loadDirectory(function(){ rush.getPageInfo() });
	}
});

//end trusted


var audio = new Audio("message.ogg");

checkMessages();
getFiatValue();


setInterval( function() {
	checkMessages();
	getFiatValue();

}, 20000 );	



function getFiatValue ()
{

	chrome.storage.local.get(["currency"], function (data) {
		
		var currency ="USD";


		if ( data.currency )
		{

			currency = data.currency;
		}

		$.ajax({
		    type: "GET",
		    url: "https://api.bitcoinaverage.com/ticker/" + currency,
		    async: true,
		    data: {}

		}).done(function (msg) {
		    price = msg.last;

		    

		    chrome.storage.local.set( {"price": price} , function (data) {

		    });

		    

		});

	});

	
}


function checkMessages( )
{

	chrome.storage.local.get(["gpgPublic", "prevSecret"], function (data) {

		if ( data.gpgPublic )
		{
			openpgp.init();

			var publicKey = openpgp.read_publicKey( data.gpgPublic );

			var keyid = s2hex( publicKey[0].publicKeyPacket.getKeyId() );
		}
		else
		{
			
			
			return;	
		}
	   

		$.ajax({
		    url: "http://rush.rubixapps.com/gpg.php",
		    data: { "function": "countMessages", "keyid": keyid, "prevSecret": data.prevSecret },
		    type: "POST",
		    dataType: "json",
		    success: function (res) {
		    	
		    	if ( res.count != "0" )
		    	{
		    		chrome.browserAction.setBadgeBackgroundColor({color:"#FF0000"});

		    		chrome.browserAction.setBadgeText({text: "" + res.count });

		    		rush.msgCount = res.count;
		    		
		    		if ( bg.count != res.count )
		    		{
		    			audio.play();

		    			if ( res.count > 1 )
		  				{
		  					sTxt="s";
		  				}
		  				else
		  				{
		  					sTxt="";
		  				}


		    			chrome.notifications.create(
		    			  'id' + new Date().getTime(),{   
		    			      type: 'basic', 
		    			      iconUrl: 'KryptoKit_48.png', 
		    			      title: 'New Message', 
		    			      message: 'You have ' + res.count + ' new message' + sTxt + ' in KryptoKit!',
		    			      
		    			      priority: 0},
		    			  function(  ) { } 

		    			); 

		    		}

		    		bg.count = res.count;

		    		chrome.extension.sendRequest({"msgCount":res.count, "type": "messageCount"});


		    	}
		    	else
		    	{
		    		chrome.browserAction.getBadgeText({}, function (txt) {
		    			if ( txt != "OK" )
		    			{
		    				chrome.browserAction.setBadgeText({text: "" });
		    			}		    		

		    		});
		    		rush.msgCount = 0;

		    	}

		    	chrome.storage.local.set( {"msgCount": res.count} , function (data) {
					rush.msgCount = res.count;
		    	});

		    	
		    },
		    error: function (xhr, opt, err) {
		        
		    }
		});

	});


	

}

function saveMsg( msg )
{
	if ( !msg )
	{
		msg = "";
	}

	chrome.storage.local.set( {"msgBuffer": msg} , function (data) {
	});
	
}

function s2hex(s)
{
  var result = '';
  for(var i=0; i<s.length; i++)
  {
    c = s.charCodeAt(i);
    result += ((c<16) ? "0" : "") + c.toString(16);
  }
  return result;
}