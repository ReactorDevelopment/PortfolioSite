import $ from 'jquery';
import React from 'react';
import {v4} from 'uuid';
import startStr from './Start';
import { babbler } from './Utils';
import { parse, HtmlGenerator } from 'latex.js';
$.fn.visible = function() {
    return this.css('visibility', 'visible');
};

$.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};
let tilePositions = null;
let sidebarOpen = false;
let pageLoaded = false;
let sidebarMax = 215;
let sidebarMin = 50;
let folderIndent = "0px";
let menuBindings = {
    "fileButton": "fileDropdown",
    "editButton": "editDropdown",
    "helpButton": "helpDropdown",
    "contactButton": "contactDropdown",
};
let activeEditor = undefined;
let selectedPageId = undefined;
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
    scp: {name: "scp.html"},
    babble: {name: "babble.html"},
    resume: {name: "resume.html"},
    about: {name: "about.html"},
    help: {name: "help.html"},
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
                            name: "about/",
                            subTree: [
                                {name: "about.html"},
                                {name: "resume.html"},
                            ]
                        },
                        {name: "help.html"},
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
    let absPath = "/";
    console.log("Nav tokens: "+tokens);
    while(tokens.length > 0){
        let foundPath = false;
        //console.log("Current token: "+tokens[0], current);
        if(tokens.length === 1 && tokens[0] === current.name.replace("/", "")) {
            //console.log("File at path: "+current.name);
            return [current, absPath];
        }
        for(let i=0; i<current.subTree.length; i++){
            //console.log(current.subTree[i].name.replace("/", ""), tokens[1], tokens);
            if(current.subTree[i].name.replace("/", "") === tokens[1]){
                //console.log("Found: "+current.subTree[i].name);
                current = current.subTree[i];
                absPath += current.name;
                tokens.shift();
                foundPath = true;
                break;
            }
        }
        if(!foundPath) return [null, ""];
    }
    //console.log("File at path: "+current.name);
    return [current, absPath];
}
function toggleSidebar(){
    if(sidebarOpen){
        collapseSidebar.innerText = ">";
        $(".sidebarItem").invisible();
        $("#sidebarContent").animate({"width": "0px"});
        document.getElementById("sidebarContent").style.display = "none";
        document.getElementById("sidebar").classList.remove("openSidebar");
        document.getElementById("sidebar").style.width = sidebarMin+"px";
        document.getElementById("explorerTitle").style.display = "none";
        document.getElementById("collapseHolder").style.width = sidebarMin+"px";
        document.getElementById("collapseHolder").classList.remove("openSidebar");
        document.getElementById("pageHolder").classList.remove("smallInvisible");
        $(".page").animate({"margin-left": sidebarMin+"px"});
        $("#terminalHolder").animate({"margin-left": sidebarMin+"px"});
        $(".titleCard").animate({"margin-left": sidebarMin+"px"});
        $("#fileEditor").animate({"margin-left": sidebarMin+"px"});
        sidebarOpen = false;
    }
    else{
        collapseSidebar.innerText = "<";
        $(".page").animate({"margin-left": sidebarMax+"px"});
        $(".titleCard").animate({"margin-left": sidebarMax+"px"});
        $("#fileEditor").animate({"margin-left": sidebarMax+"px"});
        document.getElementById("sidebarContent").style.display = "block";
        $("#sidebarContent").animate({"width": "100%"});
        //$("#sidebar").animate({"width": sidebarMax});
        document.getElementById("sidebar").style.width = "";
        document.getElementById("sidebar").classList.add("openSidebar");
        document.getElementById("pageHolder").classList.add("smallInvisible");
        document.getElementById("explorerTitle").style.display = "inline";
        document.getElementById("collapseHolder").style.width = "";
        document.getElementById("collapseHolder").classList.add("openSidebar");
        $("#terminalHolder").animate({"margin-left": sidebarMax+"px"});
        $(".sidebarItem").visible();
        sidebarOpen = true;
    }
}
function parseLatex(text){

    text = `\\documentclass{article}
    \\begin{document}
    ${text}
    \\end{document}`;
    let generator = new HtmlGenerator({ hyphenate: false });
    generator = parse(text, { generator: generator });

    //document.head.appendChild(generator.stylesAndScripts(""));
    //document.body.appendChild();
    return generator.domFragment().children[0].children[0].innerHTML;
  
}
function build(pageInfo, tiles){
    return <div id={pageInfo.pageName+"TileHolder"} className="tileHolder inner w3-display-container" style={pageInfo.holderStyle}>
        {<div className="w3-row">
                {pageInfo.gitLink ?
                    <div className="gitLink w3-row w3-mobile w3-col"><img className="w3-col" alt='gitLink'/>
                        <a className="w3-col" href={pageInfo.gitLink} target="_blank" rel="noreferrer">{pageInfo.gitTitle ? pageInfo.gitTitle : pageInfo.title}</a>
                    </div> : <span></span>
                }
                {pageInfo.extraLink ?
                    <div className="extraLink w3-row w3-mobile w3-col"><img className="w3-col" alt='extraLink'/>
                        <a className="w3-col" href={pageInfo.extraLink} target="_blank" rel="noreferrer">{pageInfo.extraTitle ? pageInfo.extraTitle : pageInfo.title}</a>
                    </div> : <span></span>
                }
                {(pageInfo.tags ? pageInfo.tags : []).map((tag, i) => 
                    <div className={"w3-col tag "+tag+"Tag w3-mobile"} key={tag}><img className="w3-col" alt={tag}/><span className="w3-col"></span></div>)
                }
            </div>
        }
        {pageInfo.title ? 
            <h1 className="pageTitle" style={{margin: 'auto', width: '100%', textAlign: 'center'}}>{pageInfo.title}</h1> : <span></span>}
        {
            tiles.map((tile, i) =>{
                //console.log("Mapping tile "+i);
                if(!tile.tags) tile.tags = [];
                let contentStyle = tile.thumbnail && !(tile.type === "gallery") ? {} : {width: "100%"};
                let imgStyle = tile.thumbnail && !(tile.type === "gallery") ? {} : {display: "block", margin: "auto"};
                let displayWidth = tile.type === "gallery" ? "row" : "col";
                let tileStyle = tile.style ? tile.style : {};
                let titleId = pageInfo.pageName+"Tile"+i+"Title";
                let titleEl = tile.title && tile.title.startsWith("#") ? 
                    <h2><b id={titleId}>{tile.title.replace("#", "")}</b></h2> :
                    tile.title && tile.title.startsWith("</>") ?
                    <p id={titleId} dangerouslySetInnerHTML={{__html: tile.title.replace("</>", "")}}></p> :
                    tile.title ? <p><b id={titleId}>{tile.title}</b></p> : <span></span>;
                while(tile.content.includes("</latex>")){
                    let beginIdx = tile.content.indexOf("<latex>");
                    let endIdx = tile.content.indexOf("</latex>");
                    let latex = parseLatex(tile.content.substring(beginIdx+7, endIdx));
                    tile.content = tile.content.substring(0, beginIdx)+latex+tile.content.substring(endIdx+8);
                }
                return <div id={pageInfo.pageName+"Tile"+i} className="displayTile w3-container w3-row" key={pageInfo.pageName+"Tile"+i} style={tileStyle}>
                    {tile.thumbnail ? <img className={`w3-${displayWidth} w3-mobile`} src={tile.thumbnail} alt='gitLogo' style={imgStyle}/> : <span></span>}
                    <div className={`w3-${displayWidth} w3-mobile`} style={contentStyle}>
                        {tile.titleLink ? <u style={{cursor: "pointer"}} onClick={() => showPage(tile.titleLink)}>{titleEl}</u> : titleEl}
                        <p id={pageInfo.pageName+"Tile"+i+"Content"} dangerouslySetInnerHTML={{__html: tile.content}}></p>
                        {tile.gitLink ?
                            <div className="gitLink w3-row w3-mobile w3-col">
                                <img className="w3-col" alt='gitLink'/>
                                <a className="w3-col" href={tile.gitLink} target="_blank" rel="noreferrer">{tile.gitTitle ? tile.gitTitle : tile.title}</a>
                            </div> : <span></span>
                        }
                        {tile.extraLink ?
                            <div className="extraLink w3-row w3-mobile w3-col">
                                <img className="w3-col" alt='extraLink'/>
                                <a className="w3-col" href={tile.extraLink} target="_blank" rel="noreferrer">{tile.extraTitle ? tile.extraTitle : tile.title}</a>
                            </div> : <span></span>
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
function showPage(pageId, isLanding){
    console.log("Showing page "+pageId);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    tilePositions = null;
    const elements = document.querySelectorAll('.page');
    Array.from(elements).forEach((element, index) => {
        element.style.display = "none";
    });
    async function loop() {
        console.log("Starting babble");
        while(selectedPageId === "babble"){
            console.log("Babble: ", selectedPageId);
            babbler();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        document.getElementById("wrapperContent").style.backgroundColor = "";
        console.log("Ending babble");
    }
    if(pageId){
        selectedPageId = pageId;
        document.getElementById("siteTitle").innerText = pages[pageId].name;
        let pageElem = document.getElementById(pageId+"Page");
        if(!pageElem){
            console.log("No element found for page "+pageId);
            document.getElementById("linesStatus").innerText = "0 Lines";
            document.getElementById("sizeStatus").innerText = "0B";
            document.getElementById("itemStatus").innerText = pages[pageId].name;
            document.getElementById("langStatus").innerText = "HTML";
            document.getElementById("encodingStatus").innerText = "UTF-8";
            return;
        }
        pageElem.style.display = "block";
        let files = document.getElementsByClassName("sidebarItem");
        for(let i=0; i<files.length; i++)
            files[i].classList.remove("selectedSideItem");
        let fileElem = document.getElementById(pageId+"-File");
        if(fileElem) fileElem.classList.add("selectedSideItem");

        document.getElementById("fileEditor").style.display = "none";
        let lineNum = pageElem.innerHTML.split(/\r\n|\r|\n/).length;
        document.getElementById("linesStatus").innerText = (lineNum > 1 ? lineNum-1 : 1)+" Lines";
        document.getElementById("sizeStatus").innerText = pageElem.innerHTML.length+"B";
        document.getElementById("itemStatus").innerText = pages[pageId].name;
        document.getElementById("langStatus").innerText = "HTML";
        document.getElementById("encodingStatus").innerText = "UTF-8";
        if(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) <= 600 && !isLanding && pageLoaded && sidebarOpen)
            toggleSidebar();
        if(selectedPageId === "babble") loop();
    }
}
// Bind to window for global reference
window.showPage = showPage;
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
    explorerDiv.style.marginLeft = folderIndent;
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
    let pageId = "custom-"+v4();
    explorerDiv.id = pageId+"-File";
    customFileDiv.id = pageId+"Page";
    if(sidebarOpen)
        customFileDiv.style.marginLeft = sidebarMax+"px";
    else
        customFileDiv.style.marginLeft = sidebarMax+"px";
    pages[pageId] = {name: fileName, content: `<p style="margin: auto; background-color: #de3a3d">
        This page is Empty! Edit its content with the '<img class="editButton" style="width: 15px; margin: 0px">' icon to fill the void!</p>`};
    customFileDiv.innerHTML += pages[pageId].content;
    button.innerText = fileName;
    button.onclick = () => {
        console.log("selecetd file: "+pageId);
        selectedPageId = pageId;
        showPage(pageId);
        setActiveEditor();
    };
    explorerDiv.appendChild(button);
    let editImg = document.createElement("IMG");
    editImg.className = "editButton";
    editImg.onclick = () => {
        document.getElementById("editorContent").innerText = pages[pageId].content;
        refreshLineNums();
        setActiveEditor(pageId);
    };
    explorerDiv.appendChild(editImg);
    document.getElementById("customContent").appendChild(explorerDiv);
    document.getElementById("pageHolder").appendChild(customFileDiv);
    navHierarchy("/home/user/public/custom")[0].subTree.push({name: fileName});
    button.onclick();
    return pageId;
}
function setFileContent(pageId, content){
    pages[pageId].content = content;
    document.getElementById(pageId+"Page").innerHTML = scriptParse(pages[pageId].content).content;
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
function renameActive(pageId){
    if(!pageId) pageId = selectedPageId;
    if(!pageId.startsWith("custom-")) return;
    console.log("renaming: "+pageId);
    stasis.container = document.getElementById(pageId+"-File");
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
            finishRenaming(selectedPageId, customRename.value);
    };
    if(!sidebarOpen) toggleSidebar();
    stasis.container.appendChild(customRename);
    customRename.focus();
}
function finishRenaming(pageId, newName){
    console.log("Renaming "+pageId+" as "+newName);
    if(!pageId) pageId = selectedPageId;
    if(newName) {
        // Rename the file within the hierarchy
        newName = newName.endsWith(".html") ? newName : newName+".html";
        let customList = navHierarchy("/home/user/public/custom")[0].subTree;
        for(let i=0; i<customList.length; i++){
            if(customList[i].name === pages[pageId].name){
                customList[i].name = newName;
                break;
            }
        }
    }
    else newName = pages[pageId].name;
    console.log("New Name of "+pageId+": "+newName, pages);
    // Rename in pages
    pages[pageId].name = newName;
    document.getElementById("siteTitle").innerText = pages[pageId].name;
    if(!stasis.container) 
        stasis.container = document.getElementById(pageId+"-File");
    console.log(stasis.container);
    console.log(navHierarchy("/home/user/public/custom")[0].subTree);
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
function removeFile(pageId){
    if(pageId){
        console.log("Removing "+pageId);
        if(!pageId) pageId = selectedPageId;
        let customList = navHierarchy("/home/user/public/custom")[0].subTree;
        // Remove file from the hierarchy
        for(let i=0; i<customList.length; i++){
            if(customList[i].name === pages[pageId].name){
                customList.splice(i, 1);
                break;
            }
        }
        // Remove from pages
        delete pages[pageId];
        // Remove from explorer
        document.getElementById(pageId+"-File").remove();
        showPage("home");
    }
}
window.onload = () => {
    let generator = new HtmlGenerator({ hyphenate: false });
    document.head.appendChild(generator.stylesAndScripts("https://cdn.jsdelivr.net/npm/latex.js@0.12.4/dist/"));
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
    showPage("home", true);
    document.getElementById("newAction").onclick = () => {
        $("#fileDropdown").fadeOut();
        newFile();
    };
    document.getElementById("removeAction").onclick = () => {
        $("#fileDropdown").fadeOut();
        removeFile();
    };
    document.getElementById("renameAction").onclick = () => {
        $("#editDropdown").fadeOut();
        renameActive();
    };
    document.getElementById("helpAction").onclick = () => {
        showPage("help");
    };
    document.body.addEventListener('click', (evt) => {
        for(let [buttonId, dropId] of Object.entries(menuBindings)){
            if(evt.target.id !== buttonId)
                $("#"+dropId).hide(0);
        }
        if(evt.target.id !== "customRename" && document.getElementById("customRename"))
            finishRenaming(selectedPageId, document.getElementById("customRename").value);
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
        refreshLineNums();
    });
    pageLoaded = true;
};
window.onscroll = (event) => {
    if(document.getElementById(selectedPageId+"TileHolder") === null) return;
    if(tilePositions === null)
        tilePositions = {};
    let tiles = document.getElementById(selectedPageId+"TileHolder").children;
    for(let tileElement of tiles){
        if(tileElement.id === "") continue;
        let tile = document.getElementById(tileElement.id);
        if(tilePositions[tileElement.id] === undefined)
            tilePositions[tileElement.id] = {isOffset: false, default: "3%", initial: true};
        
        let viewportOffset = tile.getBoundingClientRect();
        let top = viewportOffset.top;
        if(top <= window.innerHeight && tilePositions[tileElement.id].isOffset){
            $("#"+tileElement.id).animate({"margin-left": tilePositions[tileElement.id].default}, 700);
            tilePositions[tileElement.id].isOffset = false;
        }
        else if(top > window.innerHeight && !tilePositions[tileElement.id].isOffset && tilePositions[tileElement.id].initial){
            $("#"+tileElement.id).animate({"margin-left": "90%"}, 0);
            tilePositions[tileElement.id].isOffset = true;
            tilePositions[tileElement.id].initial = false;
        }
    }
};
export {$, showPage, build, hierarchy, navHierarchy, pages, newFile, finishRenaming, removeFile, folderIndent};