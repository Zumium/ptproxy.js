# ptproxy.js
A tool to help obfuscate TCP connections with obfs4
This is a Node.js port version of project PTProxy <https://github.com/gumblex/ptproxy/>
## Usage

`node ptproxy.js [-c|-s] [config.json]`

`-c|-s` is for overriding the `role` in the config file.

The JSON config file is explained below.

```
{
    // Role: client|server
    "role": "server",
    // Where to store PT state files
    "state": ".",
    // For server, which address to forward (must be an IP)
    // For client, which address to listen
    "local": "127.0.0.1:1080",
    // For server, which address to listen (must be an IP)
    // For client, the server address to connect
    "server": "0.0.0.0:23456",
    // The PT command line
    "ptexec": "obfs4proxy -logLevel=ERROR -enableLogging=true",
    // The PT name, must be only one
    "ptname": "obfs4",
    // [Client] PT arguments
    "ptargs": "cert=AAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA;iat-mode=0",
    // [Optional][Server] PT options
    // <key>=<value> [;<key>=<value> ...]
    "ptserveropt": "",
    // [Optional][Client] Which outgoing proxy must PT use
    // <proxy_type>://[<user_name>][:<password>][@]<ip>:<port>
    "ptproxy": ""
}
```

Note：When the server starts successfully, it will print out `ptargs`. Copy and paste this value to your client config file.

##Dependencies
<li>
<ul>Node.js</ul>
<ul>socks <github.com/JoshGlazebrook/socks></ul>
</li>

*Don't forget to run `npm install` command to install all dependency modules*
## Note

This only operates as a TCP proxy. If you need a HTTP/SOCKS/etc. proxy, first install related softwares on the server.

The security or obfuscation provided fully depends on the Pluggable Transport you choose. This script is only a wrapper, and is provided AS IS with ABSOLUTELY NO WARRANTY.

The program may sometimes crash(haven't find the reason yet). So please use `forever` module <https://www.npmjs.com/package/forever> to start it up instead running it directly, because `forever` module will restart it automatically when the process crashes.

##License

Copyright (C) 2016 Zumium <martin007323@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
