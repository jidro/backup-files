[fwBasic]
status = enabled
incoming = reject
outgoing = allow
routed = allow

[Rule0]
ufw_rule = 22/tcp DENY IN Anywhere
description = SSH
command = /usr/sbin/ufw deny in proto tcp from any to any port 22
policy = deny
direction = in
protocol = 
from_ip = 
from_port = 
to_ip = 
to_port = 22/tcp
iface = 
routed = 
logging = 

[Rule1]
ufw_rule = 22/tcp (v6) DENY IN Anywhere (v6)
description = SSH
command = /usr/sbin/ufw deny in proto tcp from any to any port 22
policy = deny
direction = in
protocol = 
from_ip = 
from_port = 
to_ip = 
to_port = 22/tcp
iface = 
routed = 
logging = 

