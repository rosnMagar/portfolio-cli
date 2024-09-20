import { Terminal } from "./terminal";
import fileDataJson from './files.json';

const DIRECTORY_MAP: any = {
    folders: {
        projects: [
            "summer_24_research.ai",
            "aikinator_truhacks.ai",
            "this_website.html",
            "stacks_management.py",
            "shrinkinMoon.game",
        ],
    },
    files: [
        "about.doc",
        "contact.me",
        "credits.txt"
    ]
}

const fileContent:any = fileDataJson; 

export class CommandHandler {
   
    commandMap: any;
    cwd: string[];
    terminal: Terminal;
    prompt: string;
    currentFileList: string[];

    constructor(prompt = 'root@user:', terminal: Terminal){
        this.terminal = terminal;
        this.prompt = prompt;
        this.cwd = ['~/'];
        this.currentFileList = [];
        this.commandMap = {
            help: this.help, 
            // goto:this.goto,
            ls: this.ls,
            cd: this.cd, 
            show: this.show,
        }
        this.configureDirectory();
    }

    help = (args = '') => {
        return fileDataJson.help;
    } 
    goto = (args = '') => {
        let ret:string[] = []
        ret.push(this.terminal.prompt + "goto " + args)
        if(this.ls().indexOf(args)> -1){
            document.getElementById(fileContent.id_file_map[args])?.scrollIntoView();  
            const desc = document.getElementById('description') as HTMLElement;
            desc.className = desc.className.replace('fade-out', 'fade-in'); 
        }
        
        return ret;
    }

    ls = (args = '') => {
        let ret:string[] = [];
        ret.push(this.terminal.prompt + "ls " + args)
            
        console.log(this.cwd)
        switch(args){
            case "-h":
                ret = [
                    "Description: Gives information about current working directory",
                    "USAGE: ls",
                    " "
                ];
                break;
            default:
                if(this.cwd.length > 1){
                    const key:string = this.cwd[this.cwd.length - 1].slice(0, -1);
                    ret.push(...DIRECTORY_MAP.folders[key],"");
                }else {
                    ret.push(...Object.keys(DIRECTORY_MAP.folders), ...DIRECTORY_MAP.files, "");
                }
        }
        return ret;
    }

    cd = (args: string) => {
        let ret:string[] = []

        if(args === ".."){
            if(this.cwd.length > 1){
                this.cwd.pop();
                this.currentFileList = [...DIRECTORY_MAP.files]
            }
            ret = [this.terminal.prompt + "cd " + args]
            this.terminal.prompt = this.prompt + this.cwd.join('') + " $ ";
            return ret;
        }
        const folders = Object.keys(DIRECTORY_MAP.folders)
        const files = DIRECTORY_MAP.files
        // if the folder exists
        // directory tree with depth 1
        if(folders.indexOf(args) > -1 && this.cwd.length < 2 ){
            this.cwd.push(`${args}/`)
            ret = [this.terminal.prompt + "cd " + args]
            this.terminal.prompt = this.prompt + this.cwd.join('') + " $ "; 
            this.currentFileList = [...DIRECTORY_MAP.folders[args]]
        } else if(files.indexOf(args) > -1){
            ret = [
                `${args} is not a directory!`,
                ""
            ]
        } else {
            ret = [
                "Directory Not found!",
                ""
            ]
        }

        return ret;
    }

    show = (args = '') => {
        let ret = [] ;
        ret.push(this.terminal.prompt + "show " + args);

        if(this.currentFileList.indexOf(args) > -1){
            ret.push(...fileContent[args]);
            return ret;
        } 

        ret.push([
            'not found: file not found',
            ''
        ])
        return ret;
    }

    configureDirectory = () => {
        this.terminal.prompt += this.cwd[0] + " $ ";
        this.currentFileList = [...DIRECTORY_MAP.files];
    }

    execute = (line: string) => {
        const args = line.split(' ');
        const command = args[0];
        const arg = args[1]

        try{
            return this.commandMap[command](arg);
        }catch(e){
            console.log(e)
            return [
                `${command.substring(0, 50)}: command not found!`,
                ''
            ] 
        }

    }
}