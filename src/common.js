import $ from 'jquery';
import React from 'react';
import {v4} from 'uuid';
import startStr from './Start';
$.fn.visible = function() {
    return this.css('visibility', 'visible');
};

$.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};
let tilePositions = null;
let sidebarOpen = false;
let sidebarMax = "200px";
let sidebarMin = "50px";
let menuBindings = {
    "fileButton": "fileDropdown",
    "editButton": "editDropdown",
    "helpButton": "helpDropdown"
};
let activeEditor = undefined;
let selectedFileId = undefined;
let pages = {
    home: {name: "home.html"},
    imperium: {name: "imperium.html"},
    simplex: {name: "simplex.html"},
    mipsCmd: {name: "mipsCmd.html"},
    inception: {name: "inception.html"},
    neural: {name: "neural.html"},
    chipFiring: {name: "chipFiring.html"},
    videntium: {name: "videntium.html"},
    anonHires: {name: "anonHires.html"},
    start: {name: "start.html"},
};
let stasis = {container: null};
let collapseSidebar;
let hierarchy = {
    name: "/",
    subTree: [{
        name: "home/",
        subTree: [
            {name: "user/",
                subTree: [
                    {name: "public/",
                    subTree: [
                        {name: "home.html"},
                        {
                            name: "personal/",
                            subTree: [
                                {name: "simplex.html"},
                                {name: "imperium.html"},
                                {name: "inception.html"},
                            ]
                        },
                        {
                            name: "research/",
                            subTree: [
                                {name: "neural.html"},
                                {name: "chipFiring.html"},
                            ]
                        },
                        {
                            name: "school/",
                            subTree: [
                                {name: "videntium.html"},
                                {name: "mipsCmd.html"},
                            ]
                        },
                        {
                            name: "hackathons/",
                            subTree: [
                                {name: "anonHires.html"},
                            ]
                        },
                        {
                            name: "custom/",
                            subTree: []
                        }
                    ]}
                ]
            }]
        }]
};
function navHierarchy(path){
    let tokens = path.split("/");
    if(tokens[tokens.length-1] === "") tokens.pop();
    let current = hierarchy;
    console.log("Nav tokens: "+tokens);
    while(tokens.length > 0){
        let foundPath = false;
        console.log("Current token: "+tokens[0], current);
        if(tokens.length === 1 && tokens[0] === current.name.replace("/", "")) {
            console.log("File at path: "+current.name);
            return current;
        }
        for(let i=0; i<current.subTree.length; i++){
            console.log(current.subTree[i].name.replace("/", ""), tokens[1], tokens);
            if(current.subTree[i].name.replace("/", "") === tokens[1]){
                console.log("Found: "+current.subTree[i].name);
                current = current.subTree[i];
                tokens.shift();
                foundPath = true;
                break;
            }
        }
        if(!foundPath) return null;
    }
    console.log("File at path: "+current.name);
    return current;
}
function toggleSidebar(){
    if(sidebarOpen){
        collapseSidebar.innerText = ">";
        $(".sidebarItem").invisible();
        $("#sidebar").animate({"width": sidebarMin});
        $("#sidebarContent").animate({"width": "0px"});
        $(".page").animate({"margin-left": sidebarMin});
        $("#terminalHolder").animate({"margin-left": sidebarMin});
        $(".titleCard").animate({"margin-left": sidebarMin});
        $("#fileEditor").animate({"margin-left": sidebarMin});
        sidebarOpen = false;
    }
    else{
        collapseSidebar.innerText = "<";
        $(".page").animate({"margin-left": sidebarMax});
        $(".titleCard").animate({"margin-left": sidebarMax});
        $("#fileEditor").animate({"margin-left": sidebarMax});
        $("#sidebarContent").animate({"width": "100%"});
        $("#sidebar").animate({"width": sidebarMax});
        $("#terminalHolder").animate({"margin-left": sidebarMax});
        $(".sidebarItem").visible();
        sidebarOpen = true;
    }
}
function build(pageInfo, tiles){
    return <div id="tileHolder" className="inner w3-display-container" style={pageInfo.holderStyle}>
        {pageInfo.title ? 
            <h1 className="" style={{margin: 'auto', width: '100%', textAlign: 'center'}}>{pageInfo.title}</h1> :
            <div className="w3-row">
                {pageInfo.gitLink ?
                    <div className="gitLink w3-row w3-mobile w3-col"><img className="w3-col" alt='gitLink'/>
                        <a className="w3-col" href={pageInfo.gitLink} target="_blank" rel="noreferrer">{pageInfo.gitTitle ? pageInfo.gitTitle : pageInfo.title}</a>
                    </div> : <span></span>
                }
                {pageInfo.paperLink ?
                    <div className="paperLink w3-row w3-mobile w3-col"><img className="w3-col" alt='paperLink'/>
                        <a className="w3-col" href={pageInfo.paperLink} target="_blank" rel="noreferrer">{pageInfo.paperTitle ? pageInfo.paperTitle : pageInfo.title}</a>
                    </div> : <span></span>
                }
                {pageInfo.tags.map((tag, i) => 
                    <div className={"w3-col tag "+tag+"Tag w3-mobile"} key={tag}><img className="w3-col" alt={tag}/><span className="w3-col"></span></div>)
                }
            </div>
        }
        {
            tiles.map((tile, i) =>{
                //console.log("Mapping tile "+i);
                if(!tile.tags) tile.tags = [];
                let contentStyle = tile.thumbnail && !(tile.type === "gallery") ? {} : {width: "100%"};
                let imgStyle = tile.thumbnail && !(tile.type === "gallery") ? {} : {display: "block", margin: "auto"};
                let displayWidth = tile.type === "gallery" ? "row" : "col";
                return <div id={"tile"+i} className="displayTile w3-container w3-row" key={"tile"+i}>
                    {tile.thumbnail ? <img className={`w3-${displayWidth} w3-mobile`} src={tile.thumbnail} alt='gitLogo' style={imgStyle}/> : <span></span>}
                    <div className={`w3-${displayWidth} w3-mobile`} style={contentStyle}>
                        {tile.title && tile.title.startsWith("#") ? <h2><b>{tile.title.replace("#", "")}</b></h2> : tile.title ? <p><b>{tile.title}</b></p> : <span></span>}
                        <p dangerouslySetInnerHTML={{__html: tile.content}}></p>
                        {tile.gitLink ?
                            <div className="gitLink w3-row w3-mobile w3-col"><img className="w3-col" alt='gitLink'/><a className="w3-col" href={tile.gitLink} target="_blank" rel="noreferrer">{tile.gitTitle ? tile.gitTitle : tile.title}</a></div> : <span></span>
                        }
                        {tile.tags.map((tag, i) => 
                            <div className={"w3-col tag "+tag+"Tag w3-mobile"} key={tag}><img className="w3-col" alt={tag}/><span className="w3-col"></span></div>)
                        }
                    </div>
                </div>;
            })
        }
    </div>;
}
function showPage(page){
    console.log("Showing page "+page);
    const elements = document.querySelectorAll('.page');
    Array.from(elements).forEach((element, index) => {
        element.style.display = "none";
    });
    if(page){
        document.getElementById("pageTitle").innerText = pages[page].name;
        let pageElem = document.getElementById(page+"Page");
        if(!pageElem){
            document.getElementById("linesStatus").innerText = "0 Lines";
            document.getElementById("sizeStatus").innerText = "0B";
            document.getElementById("itemStatus").innerText = pages[page].name;
            document.getElementById("langStatus").innerText = "HTML";
            document.getElementById("encodingStatus").innerText = "UTF-8";
            return;
        }
        pageElem.style.display = "block";
        document.getElementById("fileEditor").style.display = "none";
        let lineNum = pageElem.innerHTML.split(/\r\n|\r|\n/).length;
        document.getElementById("linesStatus").innerText = (lineNum > 1 ? lineNum-1 : 1)+" Lines";
        document.getElementById("sizeStatus").innerText = pageElem.innerHTML.length+"B";
        document.getElementById("itemStatus").innerText = pages[page].name;
        document.getElementById("langStatus").innerText = "HTML";
        document.getElementById("encodingStatus").innerText = "UTF-8";
    }
}
function setActiveEditor(active){
    let editorContent = document.getElementById("editorContent");
    if(activeEditor){
        let parsed = scriptParse(pages[activeEditor].content, true);
        document.getElementById(activeEditor+"Page").innerHTML = parsed.content;
        eval(parsed.scripts);
    }
    /*if(activeEditor)
        setFileContent(activeEditor, editorContent.innerText.replace("\t", "    "));*/
    activeEditor = active;
    console.log("Setting active editor to "+activeEditor);
    const elements = document.querySelectorAll('.activePage');
    Array.from(elements).forEach((element, index) => {
        element.style.display = !activeEditor ? "block" : "none";
    });
    document.getElementById("fileEditor").style.display = activeEditor ? "block" : "none";
    if(!activeEditor) {
        editorContent.innerHTML = "1";
        editorContent.innerHTML = "";
    }
    else
        showPage();
}
function refreshLineNums(){
    let lineNum = document.getElementById("editorContent").children.length;
    if(lineNum === 0) lineNum = 1;
    let editorLines = document.getElementById("editorLines");
    editorLines.innerHTML = "";
    for(let i=1; i<=lineNum; i++)
        editorLines.innerHTML += i+"<br>";
}
function newFile(fileName){
    let customFileDiv = document.createElement("DIV");
    customFileDiv.className = "page container w3-rest lightText";
    customFileDiv.style.display = "none";
    customFileDiv.style.marginTop = "35px";
    let explorerDiv = document.createElement("DIV");
    explorerDiv.className = "sidebarItem w3-row";
    explorerDiv.style.marginLeft = "10px";
    let icon = document.createElement("IMG");
    icon.className = "htmlIcon";
    explorerDiv.appendChild(icon);
    let button = document.createElement("BUTTON");
    button.className = "w3-button lightText";
    let count = "";
    let takenNames = [];
    for(let id in pages){
        console.log("Id: "+id);
        takenNames.push(pages[id].name);
    }
    while(takenNames.includes("new"+count+".html")){
        if(count === "") count = 1;
        else count ++;
    }
    if(!fileName) fileName = "new"+count+".html";
    let fileId = v4();
    explorerDiv.id = fileId+"-customContainer";
    customFileDiv.id = fileId+"Page";
    if(sidebarOpen)
        customFileDiv.style.marginLeft = sidebarMax;
    else
        customFileDiv.style.marginLeft = sidebarMax;
    pages[fileId] = {name: fileName, content: ""};
    button.innerText = fileName;
    button.onclick = () => {
        console.log("selecetd file: "+fileId);
        selectedFileId = fileId;
        showPage(fileId);
        setActiveEditor();
    };
    explorerDiv.appendChild(button);
    let editImg = document.createElement("IMG");
    editImg.className = "editButton";
    editImg.onclick = () => {
        document.getElementById("editorContent").innerText = pages[fileId].content;
        refreshLineNums();
        setActiveEditor(fileId);
    };
    explorerDiv.appendChild(editImg);
    document.getElementById("customContent").appendChild(explorerDiv);
    document.getElementById("wrapperContent").appendChild(customFileDiv);
    navHierarchy("/home/user/public/custom").subTree.push({name: fileName});
    button.onclick();
    return fileId;
}
function setFileContent(fileId, content){
    pages[fileId].content = content;
    document.getElementById(fileId+"Page").innerHTML = scriptParse(pages[fileId].content).content;
}
function scriptParse(content, prepareScripts){
    let cutContent = content;
    let scripts = "";
    //console.log("Parsing script: "+content);
    let styleString = cutContent.substring(cutContent.indexOf("<style")+6, cutContent.indexOf("</style>"));
    cutContent = cutContent.replace(styleString, styleString.replace("body{", "#_bodyDiv_{"));
    while(cutContent.includes("<script")){
        let scriptStart = cutContent.indexOf(">", cutContent.indexOf("<script"))+1;
        if(scriptStart === 0) {
            cutContent = cutContent.replace("<script", "");
            continue;
        }
        let scriptEnd = cutContent.indexOf("</script>", scriptStart);
        scripts += cutContent.substring(scriptStart, scriptEnd);
        if(!scripts.trimEnd().endsWith(";")) scripts += ";";

        //Remove script from html
        cutContent = cutContent.slice(0, cutContent.indexOf("<script")) + cutContent.slice(scriptEnd+9);
    }
    cutContent = cutContent.replace('<body', '<div id="_bodyDiv_"').replace("</body>", "</div>");
    if(prepareScripts){
        //console.log(cutContent);
        while(cutContent.includes('onclick="')){
            let onclick = cutContent.substring(cutContent.indexOf('onclick="')+9, cutContent.indexOf('"', cutContent.indexOf('onclick="')+9));
            console.log("Got onclick: "+onclick);
            let clickId = v4();
            cutContent = cutContent.replace('onclick="'+onclick+'"', 'clicktag="'+clickId+'"');
            console.log(`'[clicktag="`+clickId+`"]'`);
            scripts += `console.log(document.querySelectorAll('ul'), document.querySelectorAll('[clicktag="`+clickId+`"]'));`;
            scripts += `document.querySelectorAll('[clicktag="`+clickId+`"]')[0].onclick = () => {`+onclick+`};`;
        }
        return {content: cutContent, scripts: scripts};
    }
    //console.log(cutContent, scripts);
    return {content: cutContent, scripts: null};
}
function renameActive(fileId){
    if(!fileId) fileId = selectedFileId;
    console.log("renaming: "+fileId);
    stasis.container = document.getElementById(fileId+"-customContainer");
    stasis.icon = stasis.container.children[0];
    stasis.expFile = stasis.container.children[1];
    stasis.edit = stasis.container.children[2];
    stasis.container.innerHTML = '';
    let customRename = document.createElement("INPUT");
    customRename.id = "customRename";
    customRename.className = "w3-input";
    customRename.style.backgroundColor = "#2a2b2c";
    customRename.style.height = "25px";
    customRename.style.color = "azure";
    customRename.onkeyup = (evt) => {
        //console.log("Key: "+evt.key);
        if(""+evt.key === "Enter")
            finishRenaming(selectedFileId, customRename.value);
    };
    stasis.container.appendChild(customRename);
    customRename.focus();
}
function finishRenaming(fileId, newName){
    if(!fileId) fileId = selectedFileId;
    if(newName) {
        newName = newName.endsWith(".html") ? newName : newName+".html";
        let customList = navHierarchy("/home/user/public/custom").subTree;
        for(let i=0; i<customList.length; i++){
            if(customList[i].name === pages[fileId].name){
                customList[i].name = newName;
                break;
            }
        }
    }
    else newName = pages[fileId].name;
    console.log("New Name of "+fileId+": "+newName, pages);
    pages[fileId].name = newName;
    document.getElementById("pageTitle").innerText = pages[fileId].name;
    if(!stasis.container) 
        stasis.container = document.getElementById(fileId+"-customContainer");
    console.log(stasis.container);
    console.log(navHierarchy("/home/user/public/custom").subTree);
    if(stasis.container.children.length >= 3){
        stasis.icon = stasis.container.children[0];
        stasis.expFile = stasis.container.children[1];
        stasis.edit = stasis.container.children[2];
    }
    stasis.container.innerHTML = '';
    stasis.container.appendChild(stasis.icon);
    stasis.container.appendChild(stasis.expFile);
    stasis.container.appendChild(stasis.edit);
    stasis.container.children[1].innerText = newName;
    stasis = {container: null};
}
window.onload = () => {
    collapseSidebar = document.getElementById("collapseSidebar");
    collapseSidebar.onclick = toggleSidebar;

    let menuItems = document.getElementsByClassName("menuItem");
    for(let menuItem of menuItems){
        menuItem.onclick = () => {
            $("#"+menuBindings[menuItem.id]).fadeToggle();
        };
    }
    toggleSidebar();
    let startId = newFile("start.html");
    setFileContent(startId, startStr);
    let parsed = scriptParse(pages[startId].content, true);
    document.getElementById(startId+"Page").innerHTML = parsed.content;
    eval(parsed.scripts);
    showPage("home");
    document.getElementById("newAction").onclick = () => {
        $("#fileDropdown").fadeOut();
        newFile();
    };
    document.getElementById("renameAction").onclick = () => {
        $("#editDropdown").fadeOut();
        renameActive();
    };
    document.body.addEventListener('click', (evt) => {
        if(evt.target.id !== "fileButton")
            $("#fileDropdown").fadeOut();
        if(evt.target.id !== "editButton")
            $("#editDropdown").fadeOut();
        if(evt.target.id !== "customRename" && document.getElementById("customRename"))
            finishRenaming(selectedFileId, document.getElementById("customRename").value);
    }, true); 
    let editorContent = document.getElementById("editorContent");
    editorContent.addEventListener('input', (event) => {
        let editorContent = document.getElementById("editorContent");
        setFileContent(activeEditor, editorContent.innerText.replace("\t", "    "));
        if(editorContent.innerText.length > 0){
            let pageElem = document.getElementById(activeEditor+"Page");
            let lineNum = pageElem.innerHTML.split(/\r\n|\r|\n/).length;
            document.getElementById("linesStatus").innerText = (lineNum > 1 ? lineNum-1 : 1)+" Lines";
            document.getElementById("sizeStatus").innerText = pageElem.innerHTML.length+"B";
        }
        else
            document.getElementById(activeEditor+"Page").innerHTML = '<p style="margin: auto; background-color: #de3a3d">This page is Empty! Edit its content to fill the void!</p>';
        refreshLineNums();
    });
};
window.onscroll = (event) => {
    if(document.getElementById("tileHolder") === null) return;
    if(tilePositions === null)
        tilePositions = {};
    let tiles = document.getElementById("tileHolder").children;
    let aboveBottom = 0;
    for(let tileElement of tiles){
        if(tileElement.id === "") continue;
        let tile = document.getElementById(tileElement.id);
        if(tilePositions[tileElement.id] === undefined)
            tilePositions[tileElement.id] = {isOffset: false, default: "5%", initial: true};
        
        let viewportOffset = tile.getBoundingClientRect();
        let top = viewportOffset.top;
        if(top <= window.innerHeight && tilePositions[tileElement.id].isOffset){
            aboveBottom ++;
            $("#"+tileElement.id).animate({"margin-left": tilePositions[tileElement.id].default}, 700);
            tilePositions[tileElement.id].isOffset = false;
        }
        else if(top > window.innerHeight && !tilePositions[tileElement.id].isOffset && tilePositions[tileElement.id].initial){
            $("#"+tileElement.id).animate({"margin-left": "90%"}, 0);
            tilePositions[tileElement.id].isOffset = true;
            tilePositions[tileElement.id].initial = false;
        }
    }
    console.log(aboveBottom);
};
export {$, showPage, build, hierarchy, navHierarchy, pages, newFile, finishRenaming};