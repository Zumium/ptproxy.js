module.exports=function(){
	//此方法用于解析用户输入的命令行参数
	//遇到错误时会抛出异常
	
	//构建返回对象
	var cmd_parse_res={
		//默认角色：客户端
		"role":"client",
		//配置文件路径
		"cfg_path":"."
	};
	//去掉"node"和程序名字部分
	var args=process.argv.slice(2);
	var args_len=args.length;

	if(args_len==0){
		throw new Error('Bad arguments');
	}
	else if(args_len==1){
		//根据情况判断
		if(args[0]=='-h'||args[0]=='--help'){
			//需要显示帮助信息
			throw new Error('Need help message');
		}
		else{
			cmd_parse_res['cfg_path']=args[0];
		}
	}
	else if(args_len==2){
		cmd_parse_res['cfg_path']=args[1];
		if(args[0]=='-c'){
			cmd_parse_res['role']='client';
		}
		else if(args[0]=='-s'){
			cmd_parse_res['role']='server';
		}
		else{
			throw new Error('No such option. Use -c for client or -s for server ');
		}
	}
	return cmd_parse_res;
};
