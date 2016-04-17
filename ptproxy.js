var config=require('./config'),
    cmd_args=require('./cmdparse'),
    net=require('net'),
    socks=require('socks'),
    ptprocess=require('./ptprocess');

//解析命令行参数
var cmd_parse_result=null;
try{
	cmd_parse_result=cmd_args();
}
catch (e){
	//打印错误信息
	console.log(e.message);
	//打印用法帮助
	console.log('usage: node ptproxy [-c|-s] [config.json]');
	//已发生了错误，就退出程序吧
	process.exit(1);
}
//获取配置信息
var CFG=config(cmd_parse_result);
//客户端转发server
var server_to_pt=null;
//启动PT
var pt_event=ptprocess(CFG);
//为PT注册事件
pt_event.on('log',function(msg){
	//输出log
	console.log(msg);
});
pt_event.on('error',function(err){
	//PT启动出错
	console.log('ERROR OCCURDED!');
	console.log(err);
	process.exit(2);
});
pt_event.once('cmethod',function(vals){
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
		var ptsock=socks.createConnection(options,function(err,pt_socket,info){
			if(err){
				console.log(err);
				socket.destroy();
			}
			else{
				//PIPE everything up
				socket.pipe(pt_socket);
				pt_socket.pipe(socket);
				
				pt_socket.resume();
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
