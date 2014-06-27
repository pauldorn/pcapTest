/**
 * Created with JetBrains WebStorm.
 * User: pauldorn
 * Date: 6/24/14
 * Time: 12:13 PM
 * To change this template use File | Settings | File Templates.
 */
var Cap = require('cap').Cap,
	c = new Cap(),
    device = Cap.findDevice('192.168.1.200'),
    filter = 'arp',
    bufSize = 10 * 1024 * 1024,
    buffer = new Buffer(65535);

var linkType = c.open(device, filter, bufSize, buffer);

var buffer = new Buffer ([
    // ETHERNET
    0xff, 0xff, 0xff, 0xff, 0xff,0xff,                  // 0    = Destination MAC
    0x84, 0x8F, 0x69, 0xB7, 0x3D, 0x92,                 // 6    = Source MAC
    0x08, 0x06,                                         // 12   = EtherType = ARP
    // ARP
    0x00, 0x01,                                         // 14/0   = Hardware Type = Ethernet (or wifi)
    0x08, 0x00,                                         // 16/2   = Protocol type = ipv4 (request ipv4 route info)
    0x06, 0x04,                                         // 18/4   = Hardware Addr Len (Ether/MAC = 6), Protocol Addr Len (ipv4 = 4)
    0x00, 0x01,                                         // 20/6   = Operation (ARP, who-has)
    0x84, 0x8f, 0x69, 0xb7, 0x3d, 0x92,                 // 22/8   = Sender Hardware Addr (MAC)
    0xc0, 0xa8, 0x01, 0xc8,                             // 28/14  = Sender Protocol address (ipv4)
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00,                 // 32/18  = Target Hardware Address (Blank/nulls for who-has)
    0xc0, 0xa8, 0x01, 0xc9                              // 38/24  = Targer Protocol address (ipv4)
]);

c.send(buffer, buffer.length);



setTimeout(function() {c.close()}, 5000);
