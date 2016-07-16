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
var config=require('./config'),
    cmd_args=require('./cmdparse'),
    net=require('net'),
    socks=require('socks'),
    ev=require('events'),
    ptprocess=require('./ptprocess');

//流程控制
var main_step_control=new ev.EventEmitter();

var cmd_parse_result=null;
var CFG=null;
var pt_event=null;
//客户端转发server
var server_to_pt=null;

//解析命令行参数
main_step_control.on('parsecmd',()=>{
	try{
		cmd_parse_result=cmd_args();
		main_step_control.emit('config');
	}
	catch (e){
		//打印错误信息
		console.error(e);
		//打印用法帮助
		console.log('usage: node ptproxy [-c|-s] [config.json]');
		//已发生了错误，就退出程序吧
		process.exit(1);
	}
});

//获取配置信息
main_step_control.on('config',()=>{
	//CFG=config(cmd_parse_result);
	config(cmd_parse_result).then((cfg)=>{
		CFG=cfg;
		main_step_control.emit('startpt');
	},(err)=>{
		console.log('Error ocurrd when in config step');
		console.error(err);
		process.exit(1);
	});
});

//启动PT
main_step_control.on('startpt',()=>{
	pt_event=ptprocess(CFG);
	//为PT注册事件
	pt_event.on('log',function(msg){
		//输出log
		console.log(msg);
	});
	pt_event.on('error',function(err){
		//PT启动出错
		console.error('ERROR OCCURDED!');
		console.error(err);
		process.exit(2);
	});
	pt_event.on('cmethod',function(vals){
		//设置Client
		var local_host_port=vals[2].split(':');
		var remote_host_port=CFG['server'].split(':');
		var auth_username=CFG['ptargs'].slice(0,255);
		var auth_password=CFG['ptargs'].slice(255);
		if(auth_password==''){auth_password='\0';}
		var options={
			proxy:{
			      	ipaddress:local_host_port[0],
				port:parseInt(local_host_port[1]),
				type:5,
				authentication: {
					username: auth_username,
		            		password: auth_password
		        	}
			      },
			target:{
			       	host:remote_host_port[0],
				port:parseInt(remote_host_port[1])
			}
		};
		//
		server_to_pt=net.createServer(function(socket){
			//setting up relaying
			var ptsock=socks.createConnection(options,function(err,pt_socket,info){
				if(err){
					console.error(err);
					socket.destroy();
				}
				else{
					//PIPE everything up
					socket.pipe(pt_socket);
					pt_socket.pipe(socket);
					
					pt_socket.resume();

					//handle socket error
					socket.on('error',function(err){
						console.error('local socket error occurd!');
						console.error(err);
					});
					pt_socket.on('error',function(err){
						console.error('local pt socket error occurd!');
						console.error(err);
					});
				}
			});	
		});	
		pt_event.emit('pt_ready');
		
	});
	pt_event.on('smethod',function(vals){
		//设置Server
		console.log('======Server information======');
		console.log('"server":"'+vals[1]+'"');
		console.log('"ptname":"'+vals[0]+'"');
		vals.slice(2).forEach(function(opt){
			//if opt starts with 'ARGS:'
			if(opt.slice(0,5)=='ARGS:'){
				console.log('"ptargs":"',opt.slice(5).replace(/,/g,';'),'",');
			}
		});
		console.log('==============================');
	});
	pt_event.on('pt_ready',function(){
		var host_and_port=CFG['local'].split(':');
		server_to_pt.listen(parseInt(host_and_port[1]),host_and_port[0]);
		console.log('server_tp_pt stared');
	});
});

//启动
main_step_control.emit('parsecmd');
