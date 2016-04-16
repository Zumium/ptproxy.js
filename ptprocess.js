var cp=require('child_process'),
    ev=require('events'),
    rl=require('readline');

function PtlineParser(){
	ev.EventEmitter.call(this);
}
util.inherits(PtlineParser,ev.EventEmitter);


module.exports=function(cfg){
	//获取cfg
	var CFG=cfg;
	//新建解析器
	var ptline_parser=new PtlineParser();
	//pt_subprocess ==> PT进程
	var pt_subprocess=cp.spawn();
	//readline包装pt_subprocess
	var pt_line_reader=rl.createInterface({input:pt_subprocess.stdout});
	pt_line_reader.on('line',function(line){
		var sp=line.split(' ',1);
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
					ptline_parser.emit('error',new Error('PT returned invalid version: '+sp[1]));
				}
				break;
			case 'PROXY':
				if(sp[1]!='DONE'){
					ptline_parser.emit('error',new Error('PT returned invalid info: '+ln));
				}
				break;
			case 'CMETHOD':
				var vals=sp[1].split(' ');
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

	return ptline_parser;
};
