import React, { Component } from 'react';
import * as common from './common';
class About extends Component {

    render() {
        let tiles = [
            {
                title: "#Introduction",
                content: `My name is Matthew Pisano.  I am a student and software developer, pursuing higher education
                    with the hopes of working as an artificial intelligence researcher in the future.  This research
                    would hopefully center around cognitive artificial intelligence and natural language processing,
                    two areas that interest me greatly.  I enjoy finding interesting or useful projects to begin 
                    working on and develop them until they reach the best iteration they can be.`
            },
            {
                title: "Software Skills",
                content: `I have experience in many languages with JavaScript, Java, and Python being the ones in
                    which my skills are most developed.  I have created many professional solutions for a variety
                    of companies along with machine learning applications, both from scratch and using modules such 
                    as TensofFlow and PyTorch.  Through Java, I have created multiple android applications,
                    come of which have been published on the Google Play store.  I have used javascript in a variety
                    of personal and professional web applications, with React.js and Node.js being the libraries in which
                    I have the most experience.`,
                thumbnail: ""
            },
            {
                title: "Development Experience",
                content: `Through both my employment and professional experience through my higher education, I have
                    gained invaluable experience as a developer.  I have experience using the DevOps and Agile methodologies,
                    full-stack development, and continuous integration and continuous delivery using AWS Amplify.`,
                thumbnail: ""
            },
            {
                title: "Recent Employment",
                content: `I have research experience through the SUNY New Paltz summer undergraduate research experience, details
                    about this can be found in the <u style="cursor: pointer" onClick="window.showPage('neural')">Neural page</u>.
                    While working for Cyber Guardian Consulting Group, I have developed a variety of proprietary business
                    solutions using a variety of languages and web services, primarily AWS.  Further details of these projects
                    may be negotiated upon request. During my time at Envision2bWell, I worked as an app development intern 
                    for their application 'EnvisionWell' where I integrated google maps capabilities to the app.`,
                thumbnail: ""
            },
            {
                title: "Leadership",
                content: `A key attribute of someone who can work well with a team, whether the focus is software 
                    development, research, or something else, is leadership.  Many of my leadership skills
                    come from my time in scouting.  I spend 10 years in the Boy Scouts of America program learning the attributes
                    of good leaders and good team players.  This culminated in my Eagle Scout project where I preformed renovations
                    on my community's local recreation center.  My experience has continued on from there as I took active roles in
                    leading the front end development of the <u style="cursor: pointer" onClick="window.showPage('anonHires')">Anonymous Hires</u>
                    project and SUNY Ulster's Team Orion collaboration with IBM.`,
                thumbnail: ""
            },
        ];
        let pageInfo = {
            pageName: "about",
            holderStyle: {backgroundColor: "#33c463", borderRadius: "10px"},
            gitLink: "https://github.com/ReactorDevelopment/",
            gitTitle: "GitHub",
            extraLink: "https://docs.google.com/gview?url=https://lightsail-image-repo.s3.amazonaws.com/documents/Resume.docx",
            extraTitle: "R??sum??"
        };
        return (
            <div id={pageInfo.pageName+"Page"} className="page container w3-rest lightText" style={{display: "none"}}>
                <div className="inner titleCard" style={{position: "fixed", height: "300px", top: "50px", left: '0px', right: '0px'}}>
                    <h1 style={{margin: "auto", width: "auto", textAlign: "center"}}><b>About</b></h1><br/>
                    <h3 style={{margin: "auto", width: "auto", textAlign: "center"}}>Extra information on me as a developer, student, researcher and person</h3>
                </div>
                {common.build(pageInfo, tiles)}
            </div>
        );
    }
}

export default About;