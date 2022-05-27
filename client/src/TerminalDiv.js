import React, { useState } from 'react';

const TerminalDiv = () => {
    
    const [initialPos,   setInitialPos] = useState(null);
    const [initialSize, setInitialSize] = useState(null);
    const [terminalClosed, setTerminalClosed] = useState(false);
    const [cwd, protoSetCwd] = useState("/home/user");
    const [prevCommands, setPrevCommands] = useState([""]);
    const [draftCommand, setDraftCommand] = useState("");
    const [commandIndex, setCommandIndex] = useState(-1);
    const helpMsg = "Help";
    const genPrompt = (newCwd) => {
        return "["+(newCwd ? newCwd : cwd)+"]$ ";
    };
    const setCwd = (newCwd) => {
        protoSetCwd(newCwd);
        document.getElementById('terminalPrompt').innerText = genPrompt();
        document.getElementById('terminalInput').style.marginLeft = (9*genPrompt(newCwd).length+5)+"px";
        return "["+cwd+"]$ ";
    };
    const initial = (e) => {
        let resizable = document.getElementById('terminal');
        setInitialPos(e.clientY);
        setInitialSize(resizable.offsetHeight);
    };
    
    const resize = (e) => {
        let height = initialSize + initialPos - e.clientY + 50;
        console.log(height, terminalClosed);
        if(height > 200){
            document.getElementById('terminal').style.height = `${height}px`;
            document.getElementById('terminalOutput').style.height = `${height - 80}px`;
            document.getElementById('terminalBottom').style.visibility = "visible";
            setTerminalClosed(false);
        }
        else if(terminalClosed){
            document.getElementById('terminal').style.height = `200px`;
            document.getElementById('terminalOutput').style.height = `130px`;
            document.getElementById('terminalBottom').style.visibility = "visible";
            setTerminalClosed(false);
        }
        else{
            document.getElementById('terminal').style.height = `30px`;
            document.getElementById('terminalOutput').style.height = `0px`;
            document.getElementById('terminalBottom').style.visibility = "hidden";
            setTerminalClosed(true);
        }
        
    };
    
    const onInput = (e) => {
        //console.log(e);
        let terminalOutput = document.getElementById('terminalOutput');
        if(e.nativeEvent.inputType === "insertParagraph"){
            let command = document.getElementById('terminalInput').innerText.trim();
            console.log("Got command: "+command);
            document.getElementById('terminalInput').innerText = "";
            if(prevCommands[prevCommands.length-1] !== command) prevCommands.push(command);
            setDraftCommand("");
            terminalOutput.innerText += "\n"+parseCommand(command);
        }
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };
    
    const parseCommand = (command) => {
        let tokens = command.split(" ");
        console.log(tokens);
        switch (tokens[0]) {
            case 'help':
                return genPrompt()+command+"\n"+helpMsg;
            case 'cd':
                setCwd(tokens[1]);
                return genPrompt()+command;
            default:
                return genPrompt()+command+"\nUnknown command: '"+command+"'";
        }
    };
    
    const onKeyDown = (e) => {
        let newI = commandIndex;
        if(e.code === "ArrowUp"){
            if(commandIndex === -1) setDraftCommand(document.getElementById('terminalInput').innerText);
            if(commandIndex < prevCommands.length - 1) {
                setCommandIndex(commandIndex + 1);
                newI ++;
            }
            document.getElementById('terminalInput').innerText = prevCommands[prevCommands.length-1-newI];
        }
        else if(e.code === "ArrowDown"){
            if(commandIndex > -1) {
                setCommandIndex(commandIndex - 1);
                newI --;
            }
            document.getElementById('terminalInput').innerText = newI > -1 ? prevCommands[prevCommands.length-1-newI] : draftCommand;
        }
    };
    return(
        <div id="terminalHolder" className=' w3-row'>
            <div id='terminalThumb'
                draggable = 'true'
                onDragStart = {initial} 
                onDragEnd = {resize}
            />
            <div id='terminal'>
                <span>Terminal</span>
                <div id="terminalOutput"></div>
                <div id="terminalBottom">
                    <div id="terminalPrompt">{genPrompt()}</div>
                    <div id="terminalInput" contentEditable="true" onInput={onInput} onKeyDown={onKeyDown}></div>
                </div>
            </div>
        </div>
    );
    
};

export default TerminalDiv;
