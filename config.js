var fs=require('fs');

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
	return cfg;
}
