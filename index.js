var Cap = require('cap').Cap,
    decoders = require('cap').decoders,
    PROTOCOL = decoders.PROTOCOL;
var mac = require('mac-address');


var c = new Cap(),
    device = Cap.findDevice('192.168.1.200'),
    filter = 'arp',
    bufSize = 10 * 1024 * 1024,
    buffer = new Buffer(65535);

var linkType = c.open(device, filter, bufSize, buffer);

var ct = 0;

c.setMinBytes && c.setMinBytes(0);

c.on('packet', function(nbytes, trunc) {
//  console.log('packet: length ' + nbytes + ' bytes, truncated? '
//              + (trunc ? 'yes' : 'no'));

  // raw packet data === buffer.slice(0, nbytes)

	if (linkType === 'ETHERNET') {
		var ret = decoders.Ethernet(buffer);

		if (ret.info.type === PROTOCOL.ETHERNET.ARP) {
      		var opcode = buffer.readUInt16BE(ret.offset + 6, true);
            if(opcode === 2) {
                var macSender = mac.toString(buffer.slice(ret.offset + 8, ret.offset + 8 + 6));
                console.log('Sender mac', macSender);
                var ipSender = buffer.slice(ret.offset + 14, ret.offset + 14 + 4);
                console.log('Sender mac', JSON.stringify(ipSender));
            }
		}
	}
});

setTimeout(function(){

//    console.log("devices:", Cap.deviceList());
    var buffer = new Buffer ([
        // ETHERNET
        0xff, 0xff, 0xff, 0xff, 0xff,0xff,                  // 0    = Destination MAC
//        0x84, 0x8F, 0x69, 0xB7, 0x3D, 0x92,                 // 6    = Source MAC
		0x74, 0xea, 0x3a, 0xa3, 0xe6, 0x69,
        0x08, 0x06,                                         // 12   = EtherType = ARP
        // ARP
        0x00, 0x01,                                         // 14/0   = Hardware Type = Ethernet (or wifi)
        0x08, 0x00,                                         // 16/2   = Protocol type = ipv4 (request ipv4 route info)
        0x06, 0x04,                                         // 18/4   = Hardware Addr Len (Ether/MAC = 6), Protocol Addr Len (ipv4 = 4)
        0x00, 0x01,                                         // 20/6   = Operation (ARP, who-has)
//        0x84, 0x8f, 0x69, 0xb7, 0x3d, 0x92,                 // 22/8   = Sender Hardware Addr (MAC)
		0x74, 0xea, 0x3a, 0xa3, 0xe6, 0x69,
        0xc0, 0xa8, 0x01, 0xc7,                             // 28/14  = Sender Protocol address (ipv4)
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00,                 // 32/18  = Target Hardware Address (Blank/nulls for who-has)
        0xc0, 0xa8, 0x01, 0xc9                              // 38/24  = Targer Protocol address (ipv4)
    ]);

	function sendArp(ip) {
		setTimeout(function(){
			buffer[41] = ip;
//			var sendResult = c.send(buffer, buffer.length);
//			if(sendResult !== 0) {
//				console.log("Error on ", ip);
//			}
			c.send(buffer);
		}, ip);
		setTimeout(function() {
			c.close();
		}, 1000);
	}

	//setInterval(function(){
        for(var ip = 0; ip < 254; ip++) {
			sendArp(ip);
        }
    //}, 1000);
}, 1000);

