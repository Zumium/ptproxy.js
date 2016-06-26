/*
* Copyright (C) 2016 Zumium <martin007323@gmail.com>
*This file is part of ptproxy.js.
*
*   ptproxy.js is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   ptproxy.js is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with ptproxy.js.  If not, see <http://www.gnu.org/licenses/>.
*/
var fs=require('fs');
var sync=require('sync');
var dns=require('dns');

module.exports=function(cmd_parse_result){
	/*
	 * 配置文件格式参考
	CFG={
		//Role:client|server
		"role":"server",
		//where to store PT state file
		"state":".",
		//For server, which address is to forward
		//For client, which address is to listen
		"local":"127.0.0.1:1080",
		//For server, which address is to listen
		//For client, which address is to connect
		"server":"0.0.0.0:23456",
		//The PT command line
		"ptexec":"obfs4proxy -logLevel=ERROR -enableLogging=true",
		//The PT name
		"ptname":"obfs4",
		//[Client] PT arguments
		"ptargs":"cert=AAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA;iat-mode=0",
		"ptserveropt":"",
		"ptproxy":""
	};  */
	//读配置文件
	var cfg_data=fs.readFileSync(cmd_parse_result['cfg_path']);
	//解析配置文件(JSON)
	var cfg=JSON.parse(cfg_data);
	//合并命令行解析结果
	if(cmd_parse_result!=null){
		cfg['role']=cmd_parse_result['role'];
	}
	//转换主机名为IP地址
	//使用sync库将lookup异步方法转为同步方法
	sync(()=>{
		var client_hostname_port=cfg['client'].split(':');
		var server_hostname_port=cfg['server'].split(':');

		var client_ip=dns.lookup.sync(null,client_hostname_port[0])[0];
		var server_ip=dns.lookup.sync(null,server_hostname_port[0])[0];

		cfg['client']=client_ip+':'+client_hostname_port[1];
		cfg['server']=server_ip+':'+server_hostname_port[1];
	});

	return cfg;
}
