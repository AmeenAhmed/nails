// @Author : Ameen Ahmed
// nails.c : 
// This file is the main nails command which calls node to execute the nails main script nails.js
// It merely just sends the command line params it received to nails.js

#include<stdio.h>
#include<stdlib.h>

void main(int argc,char *argv[]) {
	
	
		char str[128] = "",cmd[128] = "";
		int i;

		for(i=1;i<argc;i++) {
			strcat(str,argv[i]);
			strcat(str," "); 
		}

        char nails_path[128];
		//printf("%s",getenv("NAILS_PATH"));
		strcpy(nails_path,getenv("NAILS_PATH"));
		//printf("$NAILS_PATH : %s\n",nails_path);
		sprintf(cmd,"node %s/nails.js %s",nails_path,str);
		//printf("%s",cmd);
		system(cmd);

	 
	
}
