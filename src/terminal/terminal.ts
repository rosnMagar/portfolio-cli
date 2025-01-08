import { CommandHandler }  from './command';
import filesDataJson from "./files.json";

// font
let consoleFont = new FontFace('consoleFont', 'url(./clacon2.ttf)');
consoleFont.load().then((font) => document.fonts.add(font))

const intro = window.innerWidth > 800 ? filesDataJson.intro: filesDataJson.intro_mobile;

export class Terminal {
    
    canvas: HTMLCanvasElement; 
    ctx: CanvasRenderingContext2D
    size: {
        margin: {
            width: number,
            height: number
        },
        padding: {
            l: number,
            r: number,
            t: number,
            b: number,
        },
        maxTerminalX: number,
        minTerminalX: number,
        minTerminalY: number,
    }
    fillStyle: string;
    backgroundColor: string;
    font: string;
    fontSize: number;
    inputBuffer: string;
    
    cursorPosition: {
        x: number,
        y: number
    }
    canvasSpaceCursorPosition: {
        x: number,
        y: number,
    }
    isEditing: boolean;
    prompt: string;

    maxLines: number;
    screenText: string[];
    commandHandler: CommandHandler;
    charWidth: number;

    constructor (size:[number, number], canvas: HTMLCanvasElement, padding = [0, 0, 0, 0]){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.size = { 
            margin: {
                width: size[0], height: size[1]
            },
            padding: {
                l: padding[0],
                r: padding[1],
                t: padding[2],
                b: padding[3],
            },
            maxTerminalX: 0,
            minTerminalX: 0,
            minTerminalY: 0
        };

        this.prompt = "root@user: "

        this.backgroundColor = "#000000";
        this.fillStyle = "#e07f19";

        this.fontSize = 15;
        this.font = `${this.fontSize}pt consoleFont`;
        this.charWidth = 10;

        this.inputBuffer = "";
        this.isEditing = false;

        this.cursorPosition = {
            x: this.size.padding.l,
            y: 40
        }

        this.canvasSpaceCursorPosition = {
            x: this.size.padding.l * this.charWidth,
            y: this.size.margin.height - this.size.padding.b * this.fontSize - this.fontSize * 1.5
        }
        this.screenText = []
        // this sets the total output screen size
        this.maxLines = 20;

        this.commandHandler = new CommandHandler(this.prompt, this);
        this.screenText = intro;

    }

    createCursor = () => {
        this.canvasSpaceCursorPosition.x = this.cursorPosition.x * this.charWidth;

        this.ctx.fillRect(this.canvasSpaceCursorPosition.x, this.canvasSpaceCursorPosition.y, this.charWidth , 2);
    }

    canvasToTerminalUnits = (canvasUnit: number) => {
       return Math.ceil(canvasUnit / this.charWidth); 
    }

    resetCursorPosition = () => {
        this.cursorPosition.x = this.prompt.length + this.size.minTerminalX;
    }

    setCursorPosition = (str:string) => {
        this.cursorPosition.x = (this.prompt.length + str.length + this.size.minTerminalX);
    }

    handleCursor = () => {

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            // if any key is pressed
            console.log(this.charWidth)
            if(/[a-zA-Z0-9-_!@#$%^&*()./ ]/.test(e.key) && e.key.length < 2){

                if(e.key == " ") e.preventDefault();

                if( this.cursorPosition.x < this.size.maxTerminalX ){
                    this.inputBuffer += e.key;
                    this.charWidth = this.ctx.measureText(e.key).width;
                    this.setCursorPosition(this.inputBuffer);
                }
            }
            // if enter is pressed
            else if(e.key == "Enter" && this.inputBuffer.length){
                this.handleInput();
           
            // if backspace is pressed
            } else if(e.key == "Backspace"){
                if(this.inputBuffer.length === 0) {
                    return
                };

                if(this.inputBuffer.length !== 0){
                    this.charWidth = this.ctx.measureText(this.inputBuffer[this.inputBuffer.length - 1]).width;
                    this.inputBuffer = this.inputBuffer.slice(0, -1);
                    this.setCursorPosition(this.inputBuffer);
                } 
            }
        });
    }

    handleInput = () => {
        this.commandHandler.execute(this.inputBuffer).map((res:string) => {
            this.screenText.push(res)
            if(this.screenText.length == this.maxLines){
                this.screenText.shift();
            }
        })
        this.inputBuffer = "" 
        this.resetCursorPosition();
    }

    renderText = () => {
        this.screenText.map((line, i: number) => {
            this.ctx.fillText(line, this.size.minTerminalX * this.charWidth, (i + this.size.minTerminalY) * this.charWidth * 2);
        })

    }

    drawBackground = () => {
        if(this.inputBuffer === ""){
            this.resetCursorPosition();
        }

        this.ctx.clearRect(0, 0, this.size.margin.width, this.size.margin.height);

        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.size.margin.width, this.size.margin.height);

        this.ctx.fillStyle = this.fillStyle;
        this.ctx.font = this.font;
        
        this.renderText();

        this.ctx.fillText(this.prompt, this.size.minTerminalX * this.charWidth, this.size.margin.height - this.charWidth * 4);
        this.ctx.fillText(this.inputBuffer, (this.prompt.length + this.size.minTerminalX) * this.charWidth, 
        this.size.margin.height - this.charWidth * 4 );

        const seed = (Date.now() / 300) % 2;

        if(Math.floor(seed) == 0)
        {
            this.ctx.fillStyle = this.fillStyle
            this.createCursor();
        }
      
    }

    render = () => {

        this.handleCursor();

        this.canvas.width = this.size.margin.width;
        this.canvas.height = this.size.margin.height;

        this.size.maxTerminalX = Math.floor(((this.canvas.width - this.size.padding.l - this.size.padding.r) / this.charWidth)) - 1;

        this.size.minTerminalX = this.size.padding.l;
        this.size.minTerminalY = this.size.padding.t;

        // this.drawBackground()
        setInterval(() => this.drawBackground(), 1000 / 60);
    }
}

// // const canvas = document.getElementById("terminal") as HTMLCanvasElement;
// const canvas = document.createElement("Canvas") as HTMLCanvasElement;
// document.body.appendChild(canvas)
// const terminal = new Terminal([640, 480], canvas, [2, 2, 3, 1]);
// terminal.render();