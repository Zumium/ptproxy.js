var cp=require('child_process'),
    ev=require('events'),
    rl=require('readline');

module.exports=function(cfg){
	//获取cfg
	var CFG=cfg;
	//新建解析器
	var ptline_parser=new ev.EventEmitter();
	//pt_subprocess ==> PT进程
	var split_cmdline=CFG['ptexec'].split(' ');
	var pt_subprocess=cp.spawn(split_cmdline[0],split_cmdline.slice(1),{env:getEnv(cfg)});
	//readline包装pt_subprocess
	var pt_line_reader=rl.createInterface({input:pt_subprocess.stdout});


	pt_line_reader.on('line',function(line){
		//处理PT进程的每一行stdout
		var sp=line.split(' ');
		console.log(sp);//DEBUG
		var kw=sp[0];
		switch(kw){
			case 'ENV-ERROR':
			case 'VERSION-ERROR':
			case 'PROXY-ERROR':
			case 'CMETHOD-ERROR':
			case 'SMETHOD-ERROR':
				//当kw等于ENV-ERROR,VERSION-ERROR,PROXY-ERROR,CMETHOD-ERROR,SMETHOD-ERROR时执行此处
				ptline_parser.emit('error',new Error(line));
				break;
			case 'VERSION':
				if(sp[1]!='1'){
					console.log(sp[1]);//DEBUG
					ptline_parser.emit('error',new Error('PT returned invalid version: '+sp[1]));
				}
				break;
			case 'PROXY':
				if(sp[1]!='DONE'){
					ptline_parser.emit('error',new Error('PT returned invalid info: '+ln));
				}
				break;
			case 'CMETHOD':
				var vals=sp.slice(1);
				console.log(vals);//DEBUG
				if(vals[0]==CFG['ptname']){
					ptline_parser.emit('cmethod',vals);
				}
				break;
			case 'SMETHOD':
				var vals=sp[1].split(' ');
				if(vals[0]==CFG['ptname']){
					ptline_parser.emit('smethod',vals);
				}
				break;
			case 'CMETHODS':
			case 'SMETHODS':
				if(sp[1]=='DONE'){
					ptline_parser.emit('log','PT started successfully');
				}
				break;
			default:
				ptline_parser.emit('log',ln);
		}
	});
	ptline_parser.on('close',function(){
		//结束子进程
		pt_subprocess.kill('SIGINT');
	});

	return ptline_parser;
};

function getEnv(CFG){
	process.env['TOR_PT_STATE_LOCATION']=CFG['state'];
	process.env['TOR_PT_MANAGED_TRANSPORT_VER']='1';
	switch(CFG['role']){
		case 'client':
			process.env['TOR_PT_CLIENT_TRANSPORTS']=CFG['ptname'];
			if(CFG['ptproxy']!=null){
				process.env['TOR_PT_PROXY']=CFG['ptproxy'];
			}
			break;
		case 'server':
			process.env['TOR_PT_SERVER_TRANSPORTS']=CFG['ptname'];
			process.env['TOR_PT_SERVER_BINDADDR']=[CFG['ptname'],CFG['server']].join('-');
			process.env['TOR_PT_ORPORT']=CFG['local'];
			process.env['TOR_PT_EXTENDED_SERVER_PORT']='';
			if(CFG['ptserveropt']!=null){
				var sp_ptserveropt=CFG['ptserveropt'].split(';');
				var temp_array=[];
				sp_ptserveropt.forEach(function(kv){
					temp_array.push([CFG['ptname'],kv].join(':'));
				});
				process.env['TOR_PT_SERVER_TRANSPORT_OPTIONS']=temp_array.join(';');
			}
			break;
	}
	return process.env;
}
