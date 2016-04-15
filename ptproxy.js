var config=require('./config'),
    cmd_args=require('./cmdparse');

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
